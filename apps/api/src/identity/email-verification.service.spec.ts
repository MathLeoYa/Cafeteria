import { BadRequestException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { EmailVerificationService } from "./email-verification.service";

describe("EmailVerificationService", () => {
  const validToken = "a".repeat(64);
  const accountId = "11111111-1111-4111-8111-111111111111";

  function setup(rows: Array<{ account_id: string }> = []) {
    const query = jest
      .fn()
      .mockResolvedValueOnce(rows)
      .mockResolvedValueOnce([]);

    const manager = { query };

    const transaction = jest.fn(
      async (callback: (value: typeof manager) => Promise<void>) => {
        await callback(manager);
      },
    );

    const dataSource = {
      query: jest.fn().mockResolvedValue([]),
      transaction,
    } as unknown as DataSource;

    return {
      service: new EmailVerificationService(dataSource),
      query,
      transaction,
      dataSource,
    };
  }

  it("genera un token aleatorio y almacena solamente su hash", async () => {
    const { service, dataSource } = setup();

    const token = await service.createToken(accountId);

    expect(token).toMatch(/^[a-f0-9]{64}$/);

    const queryMock = dataSource.query as jest.Mock;
    const parameters = queryMock.mock.calls[0][1];

    expect(parameters[0]).toBe(accountId);
    expect(parameters[1]).toMatch(/^[a-f0-9]{64}$/);
    expect(parameters[1]).not.toBe(token);
  });

  it("verifica un token válido y actualiza la cuenta", async () => {
    const { service, query } = setup([{ account_id: accountId }]);

    const result = await service.verify(validToken);

    expect(result.message).toBe("Correo electrónico verificado correctamente");
    expect(query).toHaveBeenCalledTimes(2);

    expect(query.mock.calls[1][1]).toEqual([accountId]);
  });

  it("rechaza un token inválido, caducado o utilizado", async () => {
    const { service, query } = setup([]);

    await expect(service.verify(validToken)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(query).toHaveBeenCalledTimes(1);
  });

  it("no confirma el correo cuando falla la transacción", async () => {
    const { service, query } = setup([{ account_id: accountId }]);

    query
      .mockReset()
      .mockResolvedValueOnce([{ account_id: accountId }])
      .mockRejectedValueOnce(new Error("Database unavailable"));

    await expect(service.verify(validToken)).rejects.toThrow(
      "Database unavailable",
    );

    expect(query).toHaveBeenCalledTimes(2);
  });
});
