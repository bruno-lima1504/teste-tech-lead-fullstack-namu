import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrors } from '@shared/http';
import { plainToInstance } from 'class-transformer';
import { AvailableSlotsQueryDto, SlotParamsDto, SlotResponseDto } from './slot.dto';
import { SlotService } from './slot.service';

@ApiTags('horários')
@Controller('professionals/:professionalId/slots')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @Get()
  @ApiOperation({
    summary: 'Horários livres do profissional no dia informado (calendário de São Paulo)',
  })
  @ApiErrors({
    [HttpStatus.BAD_REQUEST]: ['VALIDATION_ERROR'],
    [HttpStatus.NOT_FOUND]: ['PROFESSIONAL_NOT_FOUND'],
    [HttpStatus.UNPROCESSABLE_ENTITY]: ['PROFESSIONAL_INACTIVE'],
  })
  async listAvailable(
    @Param() params: SlotParamsDto,
    @Query() query: AvailableSlotsQueryDto,
  ): Promise<SlotResponseDto[]> {
    const slots = await this.slotService.listAvailable(params.professionalId, query.date);
    return plainToInstance(SlotResponseDto, slots, { excludeExtraneousValues: true });
  }
}
