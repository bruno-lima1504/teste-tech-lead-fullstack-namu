import { join } from 'node:path';
import type { DataSourceOptions } from 'typeorm';
import { Booking } from '../../booking/booking.entity';
import type { ScheduleConfig } from '../../config';
import { Professional } from '../../professional/professional.entity';
import { SCHEDULE_CONNECTION } from './schedule-connection';
import { Slot } from '../../slot/slot.entity';
import { User } from '../../user/user.entity';

type DatabaseConfig = ScheduleConfig['schedule']['database'];

export const dataSourceOptionsFactory = (database: DatabaseConfig): DataSourceOptions => ({
  // O @nestjs/typeorm usa o nome para achar o DataSource ao encerrar a aplicação.
  name: SCHEDULE_CONNECTION,
  type: 'mysql',
  connectorPackage: 'mysql2',
  host: database.host,
  port: database.port,
  username: database.username,
  password: database.password,
  database: database.name,
  // Datas em UTC; o fuso de São Paulo só entra na borda HTTP.
  timezone: 'Z',
  entities: [Professional, Slot, Booking, User],
  // .ts no código-fonte (CLI e testes), .js no dist.
  migrations: [join(__dirname, 'migration', '*.{ts,js}')],
  migrationsTableName: 'schedule_migrations',
  synchronize: false,
  logging: false,
});
