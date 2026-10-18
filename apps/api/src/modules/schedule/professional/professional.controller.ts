import { Controller, Get, Query } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ListProfessionalsQueryDto, ProfessionalResponseDto } from './professional.dto';
import { ProfessionalService } from './professional.service';

@Controller('professionals')
export class ProfessionalController {
  constructor(private readonly professionalService: ProfessionalService) {}

  @Get()
  async list(@Query() query: ListProfessionalsQueryDto): Promise<ProfessionalResponseDto[]> {
    const professionals = await this.professionalService.listActive(query.specialty);
    return plainToInstance(ProfessionalResponseDto, professionals, {
      excludeExtraneousValues: true,
    });
  }
}
