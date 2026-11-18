import { BadRequestException, Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import { DataSource } from "typeorm";

@Injectable()
export class EmailVerificationService {
  constructor(private readonly dataSource: DataSource) {}

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  async createToken(accountId: string): Promise<string> {
    const token = randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(token);

    await this.dataSource.query(
      `INSERT INTO identity.email_verification_tokens
       (account_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
      [accountId, tokenHash],
    );

    return token;
  }

  async verify(token: string): Promise<{ message: string }> {
    const tokenHash = this.hashToken(token);

    await this.dataSource.transaction(async (manager) => {
      const updated: Array<{ account_id: string }> = await manager.query(
        `UPDATE identity.email_verification_tokens
           SET used_at = NOW()
           WHERE token_hash = $1
             AND used_at IS NULL
             AND expires_at > NOW()
           RETURNING account_id`,
        [tokenHash],
      );

      if (updated.length !== 1) {
        throw new BadRequestException("El enlace no es válido o ha caducado");
      }

      await manager.query(
        `UPDATE identity.accounts
         SET email_verified_at = COALESCE(email_verified_at, NOW()),
             updated_at = NOW()
         WHERE id = $1`,
        [updated[0].account_id],
      );
    });

    return { message: "Correo electrónico verificado correctamente" };
  }
}
