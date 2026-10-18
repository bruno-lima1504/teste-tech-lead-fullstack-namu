import { Module } from '@nestjs/common';
import { RequestContextModule } from '@shared/context';
import { LoggerModule } from '@shared/logger';
import { ProfessionalController } from './professional/professional.controller';
import { ProfessionalService } from './professional/professional.service';
import { SchedulePersistenceModule } from './shared/persistence/schedule-persistence.module';

@Module({
  imports: [RequestContextModule, LoggerModule, SchedulePersistenceModule],
  providers: [ProfessionalService],
  controllers: [ProfessionalController],
})
export class ScheduleModule {}
