import { HttpStatus, INestApplication } from '@nestjs/common';
import type { Knex } from 'knex';
import request from 'supertest';
import { BookingStatus } from '../../booking/booking.types';
import { Specialty } from '../../professional/professional.types';
import { toSaoPauloIso } from '../../shared/sao-paulo-time';
import { createScheduleApp } from '../support/test-app';
import { createTestDbClient, resetTestDatabase } from '../support/test-database';

interface BookingBody {
  id: number;
  status: BookingStatus;
  slot: { id: number };
}

describe('GET /me/bookings', () => {
  let app: INestApplication;
  let db: Knex;

  const myBookings = (userId: string) =>
    request(app.getHttpServer()).get('/me/bookings').set('X-User-Id', userId);

  beforeAll(async () => {
    await resetTestDatabase();
    app = await createScheduleApp();
    db = createTestDbClient();
  });

  afterAll(async () => {
    await db.destroy();
    await app.close();
  });

  it('lista as sessões do usuário por início, no horário de São Paulo', async () => {
    // Usuário 1: agendamentos 1 (slot 1, daqui a ~10h) e 5 (slot 8, daqui a 5 dias).
    const slot1 = await db('availability_slots').where({ id: 1 }).first('starts_at', 'ends_at');

    const res = await myBookings('1');

    expect(res.status).toBe(HttpStatus.OK);
    expect((res.body as BookingBody[]).map(({ id, slot }) => [id, slot.id])).toEqual([
      [1, 1],
      [5, 8],
    ]);
    expect((res.body as BookingBody[])[0]).toEqual({
      id: 1,
      status: BookingStatus.Confirmed,
      createdAt: expect.stringMatching(/-03:00$/),
      cancelledAt: null,
      slot: {
        id: 1,
        startsAt: toSaoPauloIso(slot1.starts_at as Date),
        endsAt: toSaoPauloIso(slot1.ends_at as Date),
        professional: { id: 1, name: 'Dra. Helena Castro', specialty: Specialty.Psychology },
      },
    });
  });

  it('inclui as sessões canceladas, com a data do cancelamento', async () => {
    const res = await myBookings('3');

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body).toEqual([
      expect.objectContaining({
        id: 3,
        status: BookingStatus.Cancelled,
        cancelledAt: expect.stringMatching(/-03:00$/),
      }),
    ]);
  });
});
