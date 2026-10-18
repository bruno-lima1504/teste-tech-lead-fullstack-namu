import { HttpStatus, INestApplication } from '@nestjs/common';
import type { Knex } from 'knex';
import request from 'supertest';
import { BookingStatus } from '../../booking/booking.types';
import { saoPauloDate } from '../support/sao-paulo-date';
import { createScheduleApp } from '../support/test-app';
import { createTestDbClient, resetTestDatabase } from '../support/test-database';

interface SlotBody {
  id: number;
}

describe('DELETE /bookings/:id', () => {
  let app: INestApplication;
  let db: Knex;

  const cancel = (bookingId: number | string, userId?: string) => {
    const req = request(app.getHttpServer()).delete(`/bookings/${bookingId}`);
    return userId === undefined ? req : req.set('X-User-Id', userId);
  };

  beforeAll(async () => {
    // O app conecta ao banco ao subir: num MySQL novo (como o do CI), ele ainda não existe.
    await resetTestDatabase();
    app = await createScheduleApp();
    db = createTestDbClient();
  });

  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await db.destroy();
    await app.close();
  });

  it('cancela a sessão e o horário volta a ficar livre para outra pessoa', async () => {
    // Agendamento 2: Bruno, slot 3 (Dra. Helena, daqui a 2 dias).
    const res = await cancel(2, '2');

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body).toMatchObject({
      id: 2,
      status: BookingStatus.Cancelled,
      cancelledAt: expect.stringMatching(/-03:00$/),
      slot: { id: 3, professional: { id: 1 } },
    });

    const slot = await db('availability_slots').where({ id: 3 }).first('starts_at');
    const freeSlots = await request(app.getHttpServer())
      .get('/professionals/1/slots')
      .query({ date: saoPauloDate(slot.starts_at as Date) });
    expect((freeSlots.body as SlotBody[]).map(({ id }) => id)).toContain(3);

    const rebooking = await request(app.getHttpServer())
      .post('/bookings')
      .set('X-User-Id', '4')
      .send({ slotId: 3 });
    expect(rebooking.status).toBe(HttpStatus.CREATED);
  });

  it.each([
    // Agendamento 1: Ana, slot 1, que começa daqui a ~10h.
    [
      'sessão que começa em menos de 24 horas',
      1,
      '1',
      HttpStatus.UNPROCESSABLE_ENTITY,
      'CANCELLATION_WINDOW_CLOSED',
    ],
    // Agendamento 3: Carla, já cancelado no seed.
    ['sessão já cancelada', 3, '3', HttpStatus.CONFLICT, 'BOOKING_ALREADY_CANCELLED'],
    ['sessão de outra pessoa', 2, '1', HttpStatus.NOT_FOUND, 'BOOKING_NOT_FOUND'],
    ['sessão que não existe', 999, '1', HttpStatus.NOT_FOUND, 'BOOKING_NOT_FOUND'],
    ['id que não é número', 'abc', '1', HttpStatus.BAD_REQUEST, 'VALIDATION_ERROR'],
    ['pedido sem X-User-Id', 2, undefined, HttpStatus.UNAUTHORIZED, 'MISSING_USER_ID'],
  ])('recusa %s sem mudar nada', async (_case, bookingId, userId, status, code) => {
    const before = await db('bookings').orderBy('id').select();

    const res = await cancel(bookingId, userId);

    expect(res.status).toBe(status);
    expect(res.body).toMatchObject({ code });
    expect(await db('bookings').orderBy('id').select()).toEqual(before);
  });
});
