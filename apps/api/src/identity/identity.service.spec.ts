import * as argon2 from "argon2";
import { DataSource } from "typeorm";
import { IdentityService } from "./identity.service";
import { Account } from "./entities/account.entity";
import { Credential } from "./entities/credential.entity";

describe("IdentityService", () => {
  const validRegistration = {
    email: "Cliente@Ejemplo.com",
    password: "ClaveSegura123!",
  };

  const genericMessage =
    "Si la solicitud puede procesarse, recibirás instrucciones para verificar tu correo.";

  function createService() {
    const manager = {
      create: jest.fn(
        (_entity: unknown, values: Record<string, unknown>) => values,
      ),
      save: jest.fn(
        async (entity: unknown, values: Record<string, unknown>) => {
          if (entity === Account) {
            return {
              ...values,
              id: "11111111-1111-4111-8111-111111111111",
            };
          }

          return values;
        },
      ),
    };

    const dataSource = {
      transaction: jest.fn(
        async (callback: (entityManager: any) => Promise<void>) =>
          callback(manager),
      ),
    } as unknown as DataSource;

    return {
      service: new IdentityService(dataSource),
      manager,
      dataSource,
    };
  }

  it("registra un cliente con su correo normalizado y rol customer", async () => {
    const { service, manager } = createService();

    const response = await service.register(validRegistration);

    expect(response.message).toBe(genericMessage);

    expect(manager.create).toHaveBeenCalledWith(
      Account,
      expect.objectContaining({
        email: "cliente@ejemplo.com",
        role: "customer",
        emailVerifiedAt: null,
      }),
    );

    expect(manager.save).toHaveBeenCalledTimes(2);
  });

  it("guarda un hash Argon2id y nunca la contraseña original", async () => {
    const { service, manager } = createService();

    await service.register(validRegistration);

    const credentialCall = manager.save.mock.calls.find(
      (call) => call[0] === Credential,
    );

    expect(credentialCall).toBeDefined();

    const credential = credentialCall![1];
    const hash = credential.passwordHash as string;

    expect(hash).toMatch(/^\$argon2id\$/);
    expect(hash).not.toBe(validRegistration.password);
    expect(await argon2.verify(hash, validRegistration.password)).toBe(true);
  });

  it("no revela si el correo ya existe", async () => {
    const { service, manager } = createService();

    manager.save.mockRejectedValueOnce(
      Object.assign(new Error("duplicate key"), {
        code: "23505",
      }),
    );

    const response = await service.register(validRegistration);

    expect(response.message).toBe(genericMessage);
  });

  it("no oculta errores inesperados de la base de datos", async () => {
    const { service, manager } = createService();

    manager.save.mockRejectedValueOnce(new Error("Database unavailable"));

    await expect(service.register(validRegistration)).rejects.toThrow(
      "Database unavailable",
    );
  });
});
