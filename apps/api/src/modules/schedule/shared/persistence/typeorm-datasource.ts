import { DataSource } from 'typeorm';
import { scheduleConfigFactory } from '../../config';
import { dataSourceOptionsFactory } from './typeorm-datasource.factory';

// Só para o CLI do TypeORM (scripts db:*); a aplicação usa o SchedulePersistenceModule.
export default new DataSource(dataSourceOptionsFactory(scheduleConfigFactory().schedule.database));
