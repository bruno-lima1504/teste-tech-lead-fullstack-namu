import { HttpStatus, INestApplication } from '@nestjs/common';
import type { Knex } from 'knex';
import request from 'supertest';
import { saoPauloDate } from '../support/sao-paulo-date';
import { createScheduleApp } from '../support/test-app';
import { createTestDbClient, resetTestDatabase } from '../support/test-database';

interface SlotRecord {
  id: number;
  starts_at: Date;
}

describe('GET /professionals/:professionalId/slots', () => {
  let app: INestApplication;
  let db: Knex;

  const slotsOf = (professionalId: number | string, date?: string) =>
    request(app.getHttpServer())
      .get(`/professionals/${professionalId}/slots`)
      .query(date === undefined ? {} : { date });

  const seedSlot = async (id: number): Promise<SlotRecord> =>
    db<SlotRecord>('availability_slots').where({ id }).first('id', 'starts_at');

  beforeAll(async () => {
    await resetTestDatabase();
    app = await createScheduleApp();
    db = createTestDbClient();
  });

  afterAll(async () => {
    await db.destroy();
    await app.close();
  });

  it('lista os horários livres do dia, com o horário de São Paulo', async () => {
    // Seed, Dra. Helena (1), daqui a 2 dias: slot 3 às 17:00 UTC (já agendado),
    // slot 4 às 18:00 UTC e slot 5 às 02:00 UTC do dia seguinte, que em São Paulo
    // ainda é o mesmo dia (23:00).
    const day = saoPauloDate((await seedSlot(4)).starts_at);

    const res = await slotsOf(1, day);

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body).toEqual([
      { id: 4, startsAt: `${day}T15:00:00-03:00`, endsAt: `${day}T15:50:00-03:00` },
      { id: 5, startsAt: `${day}T23:00:00-03:00`, endsAt: `${day}T23:50:00-03:00` },
    ]);
  });

  it('não lista horários que já passaram', async () => {
    const yesterday = saoPauloDate((await seedSlot(2)).starts_at);

    const res = await slotsOf(1, yesterday);

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body).toEqual([]);
  });

  it('recusa profissional inativo', async () => {
    const res = await slotsOf(4, '2026-10-19');

    expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(res.body).toMatchObject({ code: 'PROFESSIONAL_INACTIVE' });
  });

  it('responde 404 para profissional que não existe', async () => {
    const res = await slotsOf(999, '2026-10-19');

    expect(res.status).toBe(HttpStatus.NOT_FOUND);
    expect(res.body).toMatchObject({ code: 'PROFESSIONAL_NOT_FOUND' });
  });

  it('recusa data que não existe no calendário', async () => {
    const res = await slotsOf(1, '2026-02-30');

    expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    expect(res.body).toMatchObject({
      code: 'VALIDATION_ERROR',
      details: { date: expect.any(Array) },
    });
  });
});
