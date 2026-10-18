import { Module } from '@nestjs/common';
import { RequestContextModule } from '@shared/context';
import { LoggerModule } from '@shared/logger';
import { ProfessionalController } from './professional/professional.controller';
import { ProfessionalService } from './professional/professional.service';
import { SchedulePersistenceModule } from './shared/persistence/schedule-persistence.module';
import { SlotController } from './slot/slot.controller';
import { SlotService } from './slot/slot.service';

@Module({
  imports: [RequestContextModule, LoggerModule, SchedulePersistenceModule],
  providers: [ProfessionalService, SlotService],
  controllers: [ProfessionalController, SlotController],
})
export class ScheduleModule {}
