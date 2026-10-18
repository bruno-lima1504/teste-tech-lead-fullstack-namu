import { Expose, Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';
import { Specialty } from '../professional/professional.types';
import { SaoPauloIso } from '../shared/schedule.dto';
import { BookingStatus } from './booking.types';

const SLOT_ID_MESSAGE = 'deve ser o id de um horário (inteiro positivo)';
const BOOKING_ID_MESSAGE = 'deve ser o id de uma sessão (inteiro positivo)';

export class CreateBookingDto {
  /** @example 4 */
  @IsInt({ message: SLOT_ID_MESSAGE })
  @IsPositive({ message: SLOT_ID_MESSAGE })
  slotId: number;
}

export class BookingParamsDto {
  @Type(() => Number)
  @IsInt({ message: BOOKING_ID_MESSAGE })
  @IsPositive({ message: BOOKING_ID_MESSAGE })
  id: number;
}

export class BookingProfessionalDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  specialty: Specialty;
}

export class BookingSlotDto {
  @Expose()
  id: number;

  /** @example 2026-10-19T15:00:00-03:00 */
  @Expose()
  @SaoPauloIso()
  startsAt: string;

  /** @example 2026-10-19T15:50:00-03:00 */
  @Expose()
  @SaoPauloIso()
  endsAt: string;

  @Expose()
  @Type(() => BookingProfessionalDto)
  professional: BookingProfessionalDto;
}

export class BookingResponseDto {
  @Expose()
  id: number;

  @Expose()
  status: BookingStatus;

  /** @example 2026-10-17T09:30:00-03:00 */
  @Expose()
  @SaoPauloIso()
  createdAt: string;

  @Expose()
  @SaoPauloIso()
  cancelledAt: string | null;

  @Expose()
  @Type(() => BookingSlotDto)
  slot: BookingSlotDto;
}
