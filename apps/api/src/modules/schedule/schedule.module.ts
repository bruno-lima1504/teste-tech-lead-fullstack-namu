import { Module } from '@nestjs/common';
import { RequestContextModule } from '@shared/context';
import { SchedulePersistenceModule } from './shared/persistence/schedule-persistence.module';

@Module({
  imports: [RequestContextModule, SchedulePersistenceModule],
})
export class ScheduleModule {}
