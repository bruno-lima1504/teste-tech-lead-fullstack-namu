import { Module } from '@nestjs/common';
import { RequestContextModule } from '@shared/context';
import { LoggerModule } from '@shared/logger';
import { SchedulePersistenceModule } from './shared/persistence/schedule-persistence.module';

@Module({
  imports: [RequestContextModule, LoggerModule, SchedulePersistenceModule],
})
export class ScheduleModule {}
