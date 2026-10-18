import { Module } from '@nestjs/common';
import { ConfigModule } from '@shared/config';
import { join } from 'node:path';
import { appConfigFactory } from './config';
import { ScheduleModule, scheduleConfigFactory } from './modules/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      // .env da raiz do monorepo; no container ele não existe e as variáveis vêm do ambiente.
      envFilePath: join(__dirname, '..', '..', '..', '.env'),
      load: [appConfigFactory, scheduleConfigFactory],
    }),
    ScheduleModule,
  ],
})
export class AppModule {}
