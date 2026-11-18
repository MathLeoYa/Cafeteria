import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import * as argon2 from "argon2";
import { RegisterDto } from "./dto/register.dto";
import { Account } from "./entities/account.entity";
import { Credential } from "./entities/credential.entity";

@Injectable()
export class IdentityService {
  constructor(private readonly dataSource: DataSource) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const email = dto.email.trim().toLowerCase();

    const genericResponse = {
      message:
        "Si la solicitud puede procesarse, recibirás instrucciones para verificar tu correo.",
    };

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    try {
      await this.dataSource.transaction(async (manager) => {
        const account = manager.create(Account, {
          email,
          role: "customer",
          emailVerifiedAt: null,
        });

        const savedAccount = await manager.save(Account, account);

        const credential = manager.create(Credential, {
          accountId: savedAccount.id,
          passwordHash,
        });

        await manager.save(Credential, credential);
      });
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505"
      ) {
        return genericResponse;
      }

      throw error;
    }

    return genericResponse;
  }
}
