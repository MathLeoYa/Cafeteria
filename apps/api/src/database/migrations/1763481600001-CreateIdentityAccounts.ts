import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateIdentityAccounts1763481600001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "identity"."accounts" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" VARCHAR(254) NOT NULL,
        "role" VARCHAR(20) NOT NULL DEFAULT 'customer',
        "email_verified_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "accounts_role_check"
          CHECK ("role" IN ('customer', 'staff', 'admin'))
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "accounts_email_unique"
      ON "identity"."accounts" (LOWER("email"))
    `);

    await queryRunner.query(`
      CREATE TABLE "identity"."credentials" (
        "account_id" UUID PRIMARY KEY,
        "password_hash" TEXT NOT NULL,
        "password_changed_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "credentials_account_fk"
          FOREIGN KEY ("account_id")
          REFERENCES "identity"."accounts"("id")
          ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "identity"."credentials"');
    await queryRunner.query('DROP TABLE IF EXISTS "identity"."accounts"');
  }
}
