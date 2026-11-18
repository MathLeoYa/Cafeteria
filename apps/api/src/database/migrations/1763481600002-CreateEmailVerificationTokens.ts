import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmailVerificationTokens1763481600002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "identity"."email_verification_tokens" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "account_id" UUID NOT NULL,
        "token_hash" CHAR(64) NOT NULL UNIQUE,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "used_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "verification_account_fk"
          FOREIGN KEY ("account_id")
          REFERENCES "identity"."accounts"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "verification_tokens_account_idx"
      ON "identity"."email_verification_tokens" ("account_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP TABLE IF EXISTS "identity"."email_verification_tokens"',
    );
  }
}
