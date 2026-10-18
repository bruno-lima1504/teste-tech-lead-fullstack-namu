import { InjectTransactionHost, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { DefaultTypeOrmRepository } from '@shared/typeorm';
import { startOfSecond } from 'date-fns';
import { QueryFailedError } from 'typeorm';
import { SCHEDULE_CONNECTION } from '../shared/persistence/schedule-connection';
import type { Slot } from '../slot/slot.entity';
import { Booking } from './booking.entity';
import { SlotUnavailableException } from './booking.exception';
import { BookingStatus } from './booking.types';

const CONFIRMED_PER_SLOT_INDEX = 'uq_bookings_confirmed_slot';

const isDuplicateOn = (error: unknown, index: string): boolean =>
  error instanceof QueryFailedError &&
  (error.driverError as { code?: string }).code === 'ER_DUP_ENTRY' &&
  error.message.includes(index);

@Injectable()
export class BookingRepository extends DefaultTypeOrmRepository<Booking> {
  constructor(
    @InjectTransactionHost(SCHEDULE_CONNECTION)
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(Booking, txHost);
  }

  hasConfirmedForSlot(slotId: number): Promise<boolean> {
    return this.repository.existsBy({ slotId, status: BookingStatus.Confirmed });
  }

  /** Intervalos semiabertos: uma sessão que termina quando a outra começa não conta. */
  userHasConfirmedOverlapping(
    userId: number,
    { startsAt, endsAt }: Pick<Slot, 'startsAt' | 'endsAt'>,
  ): Promise<boolean> {
    return this.repository
      .createQueryBuilder('booking')
      .innerJoin('booking.slot', 'slot')
      .where('booking.userId = :userId', { userId })
      .andWhere('booking.status = :confirmed', { confirmed: BookingStatus.Confirmed })
      .andWhere('slot.startsAt < :endsAt AND slot.endsAt > :startsAt', { startsAt, endsAt })
      .getExists();
  }

  /** Se o índice único recusar (um confirmado gravado por fora das checagens), vira SLOT_UNAVAILABLE. */
  async createConfirmed(userId: number, slotId: number): Promise<Booking> {
    const booking = Object.assign(new Booking(), {
      userId,
      slotId,
      status: BookingStatus.Confirmed,
      // A coluna é DATETIME sem fração: assim a resposta mostra o mesmo valor gravado.
      createdAt: startOfSecond(new Date()),
      cancelledAt: null,
    });
    try {
      return await this.save(booking);
    } catch (error) {
      if (isDuplicateOn(error, CONFIRMED_PER_SLOT_INDEX)) {
        throw new SlotUnavailableException();
      }
      throw error;
    }
  }

  findByUserWithSlotAndProfessional(userId: number): Promise<Booking[]> {
    return this.find({
      where: { userId },
      relations: { slot: { professional: true } },
      order: { slot: { startsAt: 'ASC' }, id: 'ASC' },
    });
  }
}
