import type { Professional } from '../professional/professional.types';
import type { Slot } from '../slot/slot.types';

export type BookingStatus = 'confirmed' | 'cancelled';

export interface Booking {
  id: number;
  status: BookingStatus;
  createdAt: string;
  cancelledAt: string | null;
  slot: Slot & { professional: Pick<Professional, 'id' | 'name' | 'specialty'> };
}
