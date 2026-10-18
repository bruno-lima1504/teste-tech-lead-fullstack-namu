import { Module } from '@nestjs/common';
import { RequestContextModule } from '@shared/context';
import { LoggerModule } from '@shared/logger';
import { BookingController } from './booking/booking.controller';
import { BookingService } from './booking/booking.service';
import { ProfessionalController } from './professional/professional.controller';
import { ProfessionalService } from './professional/professional.service';
import { SchedulePersistenceModule } from './shared/persistence/schedule-persistence.module';
import { SlotController } from './slot/slot.controller';
import { SlotService } from './slot/slot.service';

@Module({
  imports: [RequestContextModule, LoggerModule, SchedulePersistenceModule],
  providers: [ProfessionalService, SlotService, BookingService],
  controllers: [ProfessionalController, SlotController, BookingController],
})
export class ScheduleModule {}
