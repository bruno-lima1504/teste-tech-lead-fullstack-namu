// ref: NMU-7203
import { Transactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { ProfessionalInactiveException } from '../professional/professional.exception';
import { ProfessionalRepository } from '../professional/professional.repository';
import { SCHEDULE_CONNECTION } from '../shared/persistence/schedule-connection';
import { SlotInPastException, SlotNotFoundException } from '../slot/slot.exception';
import { SlotRepository } from '../slot/slot.repository';
import { UnknownUserException } from '../user/user.exception';
import { UserRepository } from '../user/user.repository';
import { Booking } from './booking.entity';
import { BookingOverlapException, SlotUnavailableException } from './booking.exception';
import { BookingRepository } from './booking.repository';

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

  async listForUser(userId: number): Promise<Booking[]> {
    if (!(await this.userRepository.existsById(userId))) {
      throw new UnknownUserException();
    }
    return this.bookingRepository.findByUserWithSlotAndProfessional(userId);
  }
}
