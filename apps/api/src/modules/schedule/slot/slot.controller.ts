import { Controller, Get, Param, Query } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AvailableSlotsQueryDto, SlotParamsDto, SlotResponseDto } from './slot.dto';
import { SlotService } from './slot.service';

@Controller('professionals/:professionalId/slots')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @Get()
  async listAvailable(
    @Param() params: SlotParamsDto,
    @Query() query: AvailableSlotsQueryDto,
  ): Promise<SlotResponseDto[]> {
    const slots = await this.slotService.listAvailable(params.professionalId, query.date);
    return plainToInstance(SlotResponseDto, slots, { excludeExtraneousValues: true });
  }
}
