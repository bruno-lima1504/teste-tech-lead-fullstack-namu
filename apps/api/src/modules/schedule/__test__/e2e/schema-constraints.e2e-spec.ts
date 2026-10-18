import type { Knex } from 'knex';
import { BookingStatus } from '../../booking/booking.types';
import { bookingRowFactory } from '../factory/booking.test-factory';
import { createTestDbClient, resetTestDatabase } from '../support/test-database';

// As regras valem para qualquer escritor do banco, não só para a API: aqui o
// INSERT vai direto pelo SQL.
describe('Constraints do schema', () => {
  let db: Knex;

  beforeAll(async () => {
    await resetTestDatabase();
    db = createTestDbClient();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('recusa um segundo agendamento confirmado no mesmo horário', async () => {
    // O slot 3 já tem um agendamento confirmado no seed.
    await expect(
      db('bookings').insert(bookingRowFactory.build({ slot_id: 3, user_id: 1 })),
    ).rejects.toMatchObject({ code: 'ER_DUP_ENTRY' });
  });

  it('aceita agendamentos cancelados ao lado do confirmado', async () => {
    await db('bookings').insert(
      bookingRowFactory.build({
        slot_id: 3,
        user_id: 1,
        status: BookingStatus.Cancelled,
        cancelled_at: new Date(),
      }),
    );

    const bookings = await db('bookings').where({ slot_id: 3 }).select('status');
    expect(bookings.map(({ status }) => status as BookingStatus).sort()).toEqual([
      BookingStatus.Cancelled,
      BookingStatus.Confirmed,
    ]);
  });

  it('recusa cancelado sem data de cancelamento', async () => {
    await expect(
      db('bookings').insert(
        bookingRowFactory.build({
          slot_id: 4,
          status: BookingStatus.Cancelled,
          cancelled_at: null,
        }),
      ),
    ).rejects.toMatchObject({ code: 'ER_CHECK_CONSTRAINT_VIOLATED' });
  });
});
