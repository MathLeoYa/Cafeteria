import { Injectable, UnauthorizedException } from "@nestjs/common";
import { DataSource } from "typeorm";
import * as argon2 from "argon2";

@Injectable()
export class LoginService {
  constructor(private readonly dataSource: DataSource) {}

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const rows: Array<{
      id: string;
      email: string;
      role: string;
      email_verified_at: Date | null;
      password_hash: string;
    }> = await this.dataSource.query(
      `SELECT a.id, a.email, a.role, a.email_verified_at, c.password_hash
       FROM identity.accounts a
       JOIN identity.credentials c ON c.account_id = a.id
       WHERE LOWER(a.email) = $1
       LIMIT 1`,
      [normalizedEmail],
    );

    const user = rows[0];

    if (!user || !(await argon2.verify(user.password_hash, password))) {
      throw new UnauthorizedException("Credenciales inválidas");
    }

    return {
      message: "Credenciales correctas",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.email_verified_at !== null,
      },
    };
  }
}
