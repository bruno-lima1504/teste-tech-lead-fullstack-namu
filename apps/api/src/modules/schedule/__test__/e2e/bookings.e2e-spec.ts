import { HttpStatus, INestApplication } from '@nestjs/common';
import type { Knex } from 'knex';
import request from 'supertest';
import { BookingStatus } from '../../booking/booking.types';
import { Specialty } from '../../professional/professional.types';
import { toSaoPauloIso } from '../../shared/sao-paulo-time';
import { createScheduleApp } from '../support/test-app';
import { createTestDbClient, resetTestDatabase } from '../support/test-database';

describe('POST /bookings', () => {
  let app: INestApplication;
  let db: Knex;

  const book = (body: Record<string, unknown>, userId?: string) => {
    const req = request(app.getHttpServer()).post('/bookings');
    return (userId === undefined ? req : req.set('X-User-Id', userId)).send(body);
  };

  const confirmedOn = (slotId: number) =>
    db('bookings').where({ slot_id: slotId, status: BookingStatus.Confirmed }).select('user_id');

  beforeAll(async () => {
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

  it('agenda um horário livre e devolve a sessão no horário de São Paulo', async () => {
    const slot = await db('availability_slots').where({ id: 9 }).first('starts_at', 'ends_at');

    const res = await book({ slotId: 9 }, '1');

    expect(res.status).toBe(HttpStatus.CREATED);
    expect(res.body).toEqual({
      id: expect.any(Number),
      status: BookingStatus.Confirmed,
      createdAt: expect.stringMatching(/-03:00$/),
      cancelledAt: null,
      slot: {
        id: 9,
        startsAt: toSaoPauloIso(slot.starts_at as Date),
        endsAt: toSaoPauloIso(slot.ends_at as Date),
        professional: { id: 2, name: 'Dra. Paula Nogueira', specialty: Specialty.Nutrition },
      },
    });
    expect(await confirmedOn(9)).toEqual([{ user_id: 1 }]);
  });

  it('aceita sessões encostadas: uma termina quando a outra começa', async () => {
    // Slots 11 (12:00–12:30) e 12 (12:30–13:00), mesmo dia.
    expect((await book({ slotId: 11 }, '3')).status).toBe(HttpStatus.CREATED);
    expect((await book({ slotId: 12 }, '3')).status).toBe(HttpStatus.CREATED);
  });

  it('recusa horário que já tem agendamento confirmado', async () => {
    // Slot 7: um agendamento cancelado e um confirmado no seed.
    const res = await book({ slotId: 7 }, '1');

    expect(res.status).toBe(HttpStatus.CONFLICT);
    expect(res.body).toEqual({
      statusCode: HttpStatus.CONFLICT,
      code: 'SLOT_UNAVAILABLE',
      message: expect.any(String),
    });
  });

  it('recusa sessão que se sobrepõe a outra do usuário, mesmo com outro profissional', async () => {
    // Usuário 2 tem o slot 3 (17:00–17:50, Dra. Helena); o slot 9 é 17:30–18:00, Dra. Paula.
    const res = await book({ slotId: 9 }, '2');

    expect(res.status).toBe(HttpStatus.CONFLICT);
    expect(res.body).toMatchObject({ code: 'BOOKING_OVERLAP' });
    expect(await confirmedOn(9)).toEqual([]);
  });

  it.each([
    ['horário que já passou', 2, HttpStatus.UNPROCESSABLE_ENTITY, 'SLOT_IN_PAST'],
    [
      'horário de profissional inativo',
      15,
      HttpStatus.UNPROCESSABLE_ENTITY,
      'PROFESSIONAL_INACTIVE',
    ],
    ['horário que não existe', 999, HttpStatus.NOT_FOUND, 'SLOT_NOT_FOUND'],
  ])('recusa %s', async (_case, slotId, status, code) => {
    const res = await book({ slotId }, '1');

    expect(res.status).toBe(status);
    expect(res.body).toMatchObject({ statusCode: status, code });
  });

  it('recusa slotId que não é um id', async () => {
    const res = await book({ slotId: '4' }, '1');

    expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    expect(res.body).toMatchObject({
      code: 'VALIDATION_ERROR',
      details: { slotId: expect.any(Array) },
    });
  });

  describe('identificação pelo header X-User-Id', () => {
    it.each([
      ['ausente', undefined, HttpStatus.UNAUTHORIZED, 'MISSING_USER_ID'],
      ['malformado', 'abc', HttpStatus.BAD_REQUEST, 'INVALID_USER_ID'],
      ['de usuário que não existe', '999', HttpStatus.UNAUTHORIZED, 'UNKNOWN_USER'],
    ])('recusa header %s', async (_case, userId, status, code) => {
      const res = await book({ slotId: 4 }, userId);

      expect(res.status).toBe(status);
      expect(res.body).toMatchObject({ code });
      expect(await confirmedOn(4)).toEqual([]);
    });
  });
});
