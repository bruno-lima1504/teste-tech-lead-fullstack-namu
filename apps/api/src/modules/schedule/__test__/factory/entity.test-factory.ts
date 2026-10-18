import * as Factory from 'factory.ts';
import { Booking } from '../../booking/booking.entity';
import { BookingStatus } from '../../booking/booking.types';
import { Professional } from '../../professional/professional.entity';
import { Specialty } from '../../professional/professional.types';
import { Slot } from '../../slot/slot.entity';

// Entidades em memória para os testes unitários dos services.

export const professionalFactory = Factory.Sync.makeFactory<Professional>({
  id: Factory.each((i) => i + 1),
  name: 'Dra. Helena Castro',
  specialty: Specialty.Psychology,
  sessionMinutes: 50,
  active: true,
});

export const slotFactory = Factory.Sync.makeFactory<Slot>({
  id: Factory.each((i) => i + 1),
  professionalId: 1,
  startsAt: new Date('2026-10-19T17:00:00Z'),
  endsAt: new Date('2026-10-19T17:50:00Z'),
});

export const bookingFactory = Factory.Sync.makeFactory<Booking>({
  id: Factory.each((i) => i + 1),
  slotId: 1,
  userId: 1,
  status: BookingStatus.Confirmed,
  createdAt: new Date('2026-10-17T12:00:00Z'),
  cancelledAt: null,
  confirmedSlotId: null,
});
