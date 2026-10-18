import type { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@shared/config';
import { createNestApp } from '@shared/test';
import { scheduleConfigFactory } from '../../config';
import { ScheduleModule } from '../../schedule.module';

export const createScheduleApp = async (): Promise<INestApplication> => {
  const { app } = await createNestApp([
    ConfigModule.forRoot({ load: [scheduleConfigFactory] }),
    ScheduleModule,
  ]);
  return app;
};
