import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Module } from '@nestjs/common';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@shared/config';
import { ClsModule } from 'nestjs-cls';
import type { ScheduleConfig } from '../../config';
import { SCHEDULE_CONNECTION } from './schedule-connection';
import { dataSourceOptionsFactory } from './typeorm-datasource.factory';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: SCHEDULE_CONNECTION,
      inject: [ConfigService],
      useFactory: (config: ConfigService<ScheduleConfig>) =>
        dataSourceOptionsFactory(config.get('schedule.database')),
    }),
    ClsModule.registerPlugins([
      new ClsPluginTransactional({
        connectionName: SCHEDULE_CONNECTION,
        adapter: new TransactionalAdapterTypeOrm({
          dataSourceToken: getDataSourceToken(SCHEDULE_CONNECTION),
        }),
      }),
    ]),
  ],
})
export class SchedulePersistenceModule {}
