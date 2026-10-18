import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1792278704887 implements MigrationInterface {
  name = 'Migration1792278704887';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`bookings\` ADD \`confirmed_slot_id\` int AS (IF(status = 'confirmed', slot_id, NULL)) STORED NULL`,
    );
    await queryRunner.query(
      `INSERT INTO \`typeorm_metadata\`(\`database\`, \`schema\`, \`table\`, \`type\`, \`name\`, \`value\`) VALUES (DEFAULT, ?, ?, ?, ?, ?)`,
      [
        queryRunner.connection.driver.database,
        'bookings',
        'GENERATED_COLUMN',
        'confirmed_slot_id',
        "IF(status = 'confirmed', slot_id, NULL)",
      ],
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`uq_bookings_confirmed_slot\` ON \`bookings\` (\`confirmed_slot_id\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`uq_slots_professional_starts\` ON \`availability_slots\` (\`professional_id\`, \`starts_at\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`idx_bookings_user_status\` ON \`bookings\` (\`user_id\`, \`status\`)`,
    );
    for (const [table, index] of [
      ['availability_slots', 'professional_id'],
      ['bookings', 'user_id'],
    ] as const) {
      const loaded = await queryRunner.getTable(table);
      if (loaded?.indices.some(({ name }) => name === index)) {
        await queryRunner.dropIndex(table, index);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX \`user_id\` ON \`bookings\` (\`user_id\`)`);
    await queryRunner.query(
      `CREATE INDEX \`professional_id\` ON \`availability_slots\` (\`professional_id\`)`,
    );
    await queryRunner.query(`DROP INDEX \`idx_bookings_user_status\` ON \`bookings\``);
    await queryRunner.query(
      `DROP INDEX \`uq_slots_professional_starts\` ON \`availability_slots\``,
    );
    await queryRunner.query(`DROP INDEX \`uq_bookings_confirmed_slot\` ON \`bookings\``);
    await queryRunner.query(
      `DELETE FROM \`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ? AND \`table\` = ?`,
      ['GENERATED_COLUMN', 'confirmed_slot_id', queryRunner.connection.driver.database, 'bookings'],
    );
    await queryRunner.query(`ALTER TABLE \`bookings\` DROP COLUMN \`confirmed_slot_id\``);
  }
}
