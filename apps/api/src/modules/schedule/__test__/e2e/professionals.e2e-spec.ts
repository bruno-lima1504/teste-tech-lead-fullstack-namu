import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Specialty } from '../../professional/professional.types';
import { createScheduleApp } from '../support/test-app';
import { resetTestDatabase } from '../support/test-database';

describe('GET /professionals', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await resetTestDatabase();
    app = await createScheduleApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lista só os profissionais ativos, por nome', async () => {
    const res = await request(app.getHttpServer()).get('/professionals');

    expect(res.status).toBe(HttpStatus.OK);
    // Rafael Lima (id 4) está inativo no seed.
    expect(res.body).toEqual([
      { id: 3, name: 'Carlos Menezes', specialty: Specialty.PhysicalEducation, sessionMinutes: 60 },
      { id: 1, name: 'Dra. Helena Castro', specialty: Specialty.Psychology, sessionMinutes: 50 },
      { id: 2, name: 'Dra. Paula Nogueira', specialty: Specialty.Nutrition, sessionMinutes: 30 },
    ]);
  });

  it('filtra por especialidade', async () => {
    const res = await request(app.getHttpServer())
      .get('/professionals')
      .query({ specialty: Specialty.Nutrition });

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body).toEqual([expect.objectContaining({ id: 2, specialty: Specialty.Nutrition })]);
  });

  it('recusa especialidade desconhecida', async () => {
    const res = await request(app.getHttpServer())
      .get('/professionals')
      .query({ specialty: 'astrologia' });

    expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    expect(res.body).toEqual({
      statusCode: HttpStatus.BAD_REQUEST,
      code: 'VALIDATION_ERROR',
      message: expect.any(String),
      details: { specialty: [expect.stringContaining('psicologia')] },
    });
  });
});
