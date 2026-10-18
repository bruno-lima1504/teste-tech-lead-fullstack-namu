import { InjectTransactionHost, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { DefaultTypeOrmRepository } from '@shared/typeorm';
import { Booking } from '../booking/booking.entity';
import { BookingStatus } from '../booking/booking.types';
import { SCHEDULE_CONNECTION } from '../shared/persistence/schedule-connection';
import type { DateRange } from '../shared/sao-paulo-time';
import { Slot } from './slot.entity';

@Injectable()
export class SlotRepository extends DefaultTypeOrmRepository<Slot> {
  constructor(
    @InjectTransactionHost(SCHEDULE_CONNECTION)
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(Slot, txHost);
  }

  findAvailableStartingIn(professionalId: number, range: DateRange, now: Date): Promise<Slot[]> {
    return this.repository
      .createQueryBuilder('slot')
      .leftJoin(Booking, 'booking', 'booking.slotId = slot.id AND booking.status = :confirmed', {
        confirmed: BookingStatus.Confirmed,
      })
      .where('slot.professionalId = :professionalId', { professionalId })
      .andWhere('slot.startsAt >= :start AND slot.startsAt < :end', range)
      .andWhere('slot.startsAt > :now', { now })
      .andWhere('booking.id IS NULL')
      .orderBy('slot.startsAt', 'ASC')
      .getMany();
  }

  /** SELECT … FOR UPDATE: quem disputa o mesmo horário espera aqui até a outra transação terminar. */
  lockById(id: number): Promise<Slot | null> {
    return this.findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
  }
}
