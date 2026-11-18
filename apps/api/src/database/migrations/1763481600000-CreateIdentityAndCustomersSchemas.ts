import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateIdentityAndCustomersSchemas1763481600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS "identity"');
    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS "customers"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP SCHEMA IF EXISTS "customers"');
    await queryRunner.query('DROP SCHEMA IF EXISTS "identity"');
  }
}
