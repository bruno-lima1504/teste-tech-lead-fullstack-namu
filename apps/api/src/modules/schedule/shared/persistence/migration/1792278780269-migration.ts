import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1792278780269 implements MigrationInterface {
  name = 'Migration1792278780269';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`bookings\` ADD CONSTRAINT \`chk_bookings_cancelled_at\` CHECK ((status = 'cancelled') = (cancelled_at IS NOT NULL))`,
    );
    await queryRunner.query(
      `ALTER TABLE \`availability_slots\` ADD CONSTRAINT \`chk_slots_ends_after_starts\` CHECK (ends_at > starts_at)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`availability_slots\` DROP CHECK \`chk_slots_ends_after_starts\``,
    );
    await queryRunner.query(`ALTER TABLE \`bookings\` DROP CHECK \`chk_bookings_cancelled_at\``);
  }
}
