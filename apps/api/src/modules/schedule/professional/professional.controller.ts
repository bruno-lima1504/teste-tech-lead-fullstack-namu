import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrors } from '@shared/http';
import { plainToInstance } from 'class-transformer';
import { ListProfessionalsQueryDto, ProfessionalResponseDto } from './professional.dto';
import { ProfessionalService } from './professional.service';

@ApiTags('profissionais')
@Controller('professionals')
export class ProfessionalController {
  constructor(private readonly professionalService: ProfessionalService) {}

  @Get()
  @ApiOperation({ summary: 'Profissionais ativos, por nome; filtro opcional por especialidade' })
  @ApiErrors({ [HttpStatus.BAD_REQUEST]: ['VALIDATION_ERROR'] })
  async list(@Query() query: ListProfessionalsQueryDto): Promise<ProfessionalResponseDto[]> {
    const professionals = await this.professionalService.listActive(query.specialty);
    return plainToInstance(ProfessionalResponseDto, professionals, {
      excludeExtraneousValues: true,
    });
  }
}
