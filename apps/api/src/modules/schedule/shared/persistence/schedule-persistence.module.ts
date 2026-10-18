import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Module } from '@nestjs/common';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@shared/config';
import { ClsModule } from 'nestjs-cls';
import type { ScheduleConfig } from '../../config';
import { UserRepository } from '../../user/user.repository';
import { SCHEDULE_CONNECTION } from './schedule-connection';
import { dataSourceOptionsFactory } from './typeorm-datasource.factory';

const repositories = [UserRepository];

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
  providers: repositories,
  exports: repositories,
})
export class SchedulePersistenceModule {}
