import { Expose, Type } from 'class-transformer';
import { IsInt, IsISO8601, IsPositive, Matches } from 'class-validator';
import { SaoPauloIso } from '../shared/schedule.dto';

const ID_MESSAGE = 'deve ser um id (inteiro positivo)';

export class SlotParamsDto {
  @Type(() => Number)
  @IsInt({ message: ID_MESSAGE })
  @IsPositive({ message: ID_MESSAGE })
  professionalId: number;
}

export class AvailableSlotsQueryDto {
  /**
   * Dia no calendário de São Paulo.
   * @example 2026-10-19
   */
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'deve estar no formato AAAA-MM-DD' })
  @IsISO8601({ strict: true }, { message: 'deve ser uma data que existe no calendário' })
  date: string;
}

export class SlotResponseDto {
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
}
