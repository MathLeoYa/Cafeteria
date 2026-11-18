import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class CustomersService {
  constructor(private readonly dataSource: DataSource) {}

  async getProfile(accountId: string) {
    const rows: Array<{
      id: string;
      email: string;
      role: string;
      email_verified_at: Date | null;
      display_name: string | null;
    }> = await this.dataSource.query(
      `SELECT a.id, a.email, a.role, a.email_verified_at,
              p.display_name
       FROM identity.accounts a
       LEFT JOIN customers.profiles p ON p.account_id = a.id
       WHERE a.id = $1`,
      [accountId],
    );

    if (rows.length === 0) {
      throw new NotFoundException("Cliente no encontrado");
    }

    const customer = rows[0];

    return {
      id: customer.id,
      email: customer.email,
      role: customer.role,
      emailVerified: customer.email_verified_at !== null,
      displayName: customer.display_name,
    };
  }

  async updateDisplayName(accountId: string, displayName: string) {
    const rows: Array<{ account_id: string }> = await this.dataSource.query(
      `INSERT INTO customers.profiles (account_id, display_name)
         SELECT id, $2
         FROM identity.accounts
         WHERE id = $1 AND role = 'customer'
         ON CONFLICT (account_id)
         DO UPDATE SET display_name = EXCLUDED.display_name,
                       updated_at = NOW()
         RETURNING account_id`,
      [accountId, displayName.trim()],
    );

    if (rows.length === 0) {
      throw new NotFoundException("Cliente no encontrado");
    }

    return { message: "Nombre del perfil actualizado" };
  }
}
