import { HttpStatus, INestApplication } from '@nestjs/common';
import { addMinutes } from 'date-fns';
import type { Knex } from 'knex';
import request from 'supertest';
import { BookingStatus } from '../../booking/booking.types';
import { slotRowFactory } from '../factory/slot.test-factory';
import { createScheduleApp } from '../support/test-app';
import { createTestDbClient, resetTestDatabase } from '../support/test-database';

// Requisições simultâneas contra a API real, cada uma em sua conexão do pool. Cada
// cenário roda algumas vezes: uma corrida que passa uma vez só não diz muito.
const ROUNDS = 3;

interface ErrorBody {
  code: string;
}

describe('POST /bookings com requisições simultâneas', () => {
  let app: INestApplication;
  let db: Knex;

  const book = (slotId: number, userId: number) =>
    request(app.getHttpServer())
      .post('/bookings')
      .set('X-User-Id', String(userId))
      .send({ slotId });

  beforeAll(async () => {
    // O app conecta ao banco ao subir: num MySQL novo (como o do CI), ele ainda não existe.
    await resetTestDatabase();
    app = await createScheduleApp();
    // Servidor escutando de verdade: sem isso o supertest abriria uma porta por requisição.
    await app.listen(0);
    db = createTestDbClient();
  });

  afterAll(async () => {
    await db.destroy();
    await app.close();
  });

  it('só uma de várias pessoas consegue o mesmo horário', async () => {
    for (let round = 0; round < ROUNDS; round++) {
      await resetTestDatabase();

      const responses = await Promise.all([1, 2, 3, 4].map((userId) => book(4, userId)));

      const statuses = responses.map(({ status }) => status).sort();
      expect(statuses).toEqual([
        HttpStatus.CREATED,
        HttpStatus.CONFLICT,
        HttpStatus.CONFLICT,
        HttpStatus.CONFLICT,
      ]);
      const conflicts = responses.filter(({ status }) => status === HttpStatus.CONFLICT);
      expect(conflicts.map(({ body }) => (body as ErrorBody).code)).toEqual(
        Array(3).fill('SLOT_UNAVAILABLE'),
      );
      expect(
        await db('bookings')
          .where({ slot_id: 4, status: BookingStatus.Confirmed })
          .count({ n: '*' }),
      ).toEqual([{ n: 1 }]);
    }
  });

  it('a mesma pessoa não fecha duas sessões sobrepostas pedidas ao mesmo tempo', async () => {
    for (let round = 0; round < ROUNDS; round++) {
      await resetTestDatabase();
      // Slot 4 é 18:00–18:50 com a Dra. Helena; o novo horário, 18:30–19:30 com o Carlos.
      const slot4 = await db('availability_slots').where({ id: 4 }).first('starts_at');
      const startsAt = slot4.starts_at as Date;
      const [overlappingId] = await db('availability_slots').insert(
        slotRowFactory.build({
          professional_id: 3,
          starts_at: addMinutes(startsAt, 30),
          ends_at: addMinutes(startsAt, 90),
        }),
      );

      const responses = await Promise.all([book(4, 3), book(overlappingId!, 3)]);

      const statuses = responses.map(({ status }) => status).sort();
      expect(statuses).toEqual([HttpStatus.CREATED, HttpStatus.CONFLICT]);
      const conflict = responses.find(({ status }) => status === HttpStatus.CONFLICT);
      expect((conflict?.body as ErrorBody).code).toBe('BOOKING_OVERLAP');
      expect(
        await db('bookings')
          .where({ user_id: 3, status: BookingStatus.Confirmed })
          .whereIn('slot_id', [4, overlappingId!])
          .count({ n: '*' }),
      ).toEqual([{ n: 1 }]);
    }
  });
});
