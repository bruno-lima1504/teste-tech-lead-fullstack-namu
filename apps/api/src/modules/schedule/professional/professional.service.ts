import { Injectable } from '@nestjs/common';
import { Professional } from './professional.entity';
import { ProfessionalRepository } from './professional.repository';
import { Specialty } from './professional.types';

@Injectable()
export class ProfessionalService {
  constructor(private readonly professionalRepository: ProfessionalRepository) {}

  listActive(specialty?: Specialty): Promise<Professional[]> {
    return this.professionalRepository.findActive(specialty);
  }
}
