import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCustomerProfiles1763481600003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "customers"."profiles" (
        "account_id" UUID PRIMARY KEY,
        "display_name" VARCHAR(100),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "profiles_account_fk"
          FOREIGN KEY ("account_id")
          REFERENCES "identity"."accounts"("id")
          ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "customers"."profiles"');
  }
}
