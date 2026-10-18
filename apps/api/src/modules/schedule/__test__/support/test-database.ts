import knex, { Knex } from 'knex';
import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { scheduleConfigFactory } from '../../config';
import { dataSourceOptionsFactory } from '../../shared/persistence/typeorm-datasource.factory';
import { REPO_ROOT } from './repo-root';

const database = () => scheduleConfigFactory().schedule.database;

export const resetTestDatabase = async (): Promise<void> => {
  const db = database();
  const connection = await createConnection({
    host: db.host,
    port: db.port,
    user: db.username,
    password: db.password,
    multipleStatements: true,
  });
  try {
    await connection.query(
      `DROP DATABASE IF EXISTS \`${db.name}\`; CREATE DATABASE \`${db.name}\`; USE \`${db.name}\`;`,
    );
    await connection.query(readFileSync(join(REPO_ROOT, './infra/seed.sql'), 'utf8'));
  } finally {
    await connection.end();
  }
  const dataSource = await new DataSource(dataSourceOptionsFactory(db)).initialize();
  try {
    await dataSource.runMigrations();
  } finally {
    await dataSource.destroy();
  }
};

export const createTestDbClient = (): Knex => {
  const db = database();
  return knex({
    client: 'mysql2',
    connection: {
      host: db.host,
      port: db.port,
      user: db.username,
      password: db.password,
      database: db.name,
      timezone: 'Z',
    },
  });
};
