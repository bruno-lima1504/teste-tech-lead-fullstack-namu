import { Injectable } from '@nestjs/common';
import {
  ProfessionalInactiveException,
  ProfessionalNotFoundException,
} from '../professional/professional.exception';
import { ProfessionalRepository } from '../professional/professional.repository';
import { saoPauloDayRange } from '../shared/sao-paulo-time';
import { Slot } from './slot.entity';
import { SlotRepository } from './slot.repository';

@Injectable()
export class SlotService {
  constructor(
    private readonly professionalRepository: ProfessionalRepository,
    private readonly slotRepository: SlotRepository,
  ) {}

  async listAvailable(professionalId: number, day: string): Promise<Slot[]> {
    const professional = await this.professionalRepository.findOneById(professionalId);
    if (!professional) {
      throw new ProfessionalNotFoundException();
    }
    if (!professional.active) {
      throw new ProfessionalInactiveException();
    }
    return this.slotRepository.findAvailableStartingIn(
      professionalId,
      saoPauloDayRange(day),
      new Date(),
    );
  }
}
