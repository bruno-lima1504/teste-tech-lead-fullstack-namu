import * as Factory from 'factory.ts';
import { BookingStatus } from '../../booking/booking.types';

/** Linha da tabela bookings, como o knex insere. */
export interface BookingRow {
  slot_id: number;
  user_id: number;
  status: BookingStatus;
  created_at: Date;
  cancelled_at: Date | null;
}

export const bookingRowFactory = Factory.Sync.makeFactory<BookingRow>({
  slot_id: 1,
  user_id: 1,
  status: BookingStatus.Confirmed,
  created_at: Factory.each(() => new Date()),
  cancelled_at: null,
});
