// ref: NMU-7203
import { Transactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { subHours } from 'date-fns';
import { ProfessionalInactiveException } from '../professional/professional.exception';
import { ProfessionalRepository } from '../professional/professional.repository';
import { SCHEDULE_CONNECTION } from '../shared/persistence/schedule-connection';
import { SlotInPastException, SlotNotFoundException } from '../slot/slot.exception';
import { SlotRepository } from '../slot/slot.repository';
import { UnknownUserException } from '../user/user.exception';
import { UserRepository } from '../user/user.repository';
import { Booking } from './booking.entity';
import {
  BookingAlreadyCancelledException,
  BookingNotFoundException,
  BookingOverlapException,
  CancellationWindowClosedException,
  SlotUnavailableException,
} from './booking.exception';
import { BookingRepository } from './booking.repository';
import { BookingStatus, CANCELLATION_NOTICE_HOURS } from './booking.types';

@Injectable()
export class BookingService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly slotRepository: SlotRepository,
    private readonly professionalRepository: ProfessionalRepository,
    private readonly bookingRepository: BookingRepository,
  ) {}

  @Transactional<TransactionalAdapterTypeOrm>(SCHEDULE_CONNECTION, {
    isolationLevel: 'READ COMMITTED',
  })
  async create(userId: number, slotId: number): Promise<Booking> {
    if (!(await this.userRepository.lockById(userId))) {
      throw new UnknownUserException();
    }

    const slot = await this.slotRepository.lockById(slotId);
    if (!slot) {
      throw new SlotNotFoundException();
    }

    // A FK garante que o profissional existe.
    const professional = await this.professionalRepository.findOneById(slot.professionalId);
    if (!professional?.active) {
      throw new ProfessionalInactiveException();
    }

    if (slot.startsAt.getTime() <= Date.now()) {
      throw new SlotInPastException();
    }

    if (await this.bookingRepository.hasConfirmedForSlot(slot.id)) {
      throw new SlotUnavailableException();
    }

    if (await this.bookingRepository.userHasConfirmedOverlapping(userId, slot)) {
      throw new BookingOverlapException();
    }

    const booking = await this.bookingRepository.createConfirmed(userId, slot.id);
    booking.slot = { ...slot, professional };
    return booking;
  }

  @Transactional<TransactionalAdapterTypeOrm>(SCHEDULE_CONNECTION, {
    isolationLevel: 'READ COMMITTED',
  })
  async cancel(userId: number, bookingId: number): Promise<Booking> {
    if (!(await this.userRepository.existsById(userId))) {
      throw new UnknownUserException();
    }

    // Sessão de outra pessoa responde como inexistente: não revela que o id existe.
    const booking = await this.bookingRepository.lockByIdWithSlotAndProfessional(bookingId);
    if (!booking || booking.userId !== userId) {
      throw new BookingNotFoundException();
    }

    if (booking.status === BookingStatus.Cancelled) {
      throw new BookingAlreadyCancelledException();
    }

    // Exatamente 24 horas antes ainda pode.
    if (Date.now() > subHours(booking.slot.startsAt, CANCELLATION_NOTICE_HOURS).getTime()) {
      throw new CancellationWindowClosedException();
    }

    return this.bookingRepository.markCancelled(booking);
  }

  async listForUser(userId: number): Promise<Booking[]> {
    if (!(await this.userRepository.existsById(userId))) {
      throw new UnknownUserException();
    }
    return this.bookingRepository.findByUserWithSlotAndProfessional(userId);
  }
}
