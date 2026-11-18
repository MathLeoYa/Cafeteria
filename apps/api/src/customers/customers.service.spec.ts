import { DataSource } from "typeorm";
import { CustomersService } from "./customers.service";

describe("CustomersService", () => {
  it("consulta un perfil de cliente", async () => {
    const dataSource = {
      query: jest.fn().mockResolvedValue([
        {
          id: "11111111-1111-4111-8111-111111111111",
          email: "cliente@example.com",
          role: "customer",
          email_verified_at: null,
          display_name: "Cliente de prueba",
        },
      ]),
    } as unknown as DataSource;

    const service = new CustomersService(dataSource);

    const profile = await service.getProfile(
      "11111111-1111-4111-8111-111111111111",
    );

    expect(profile.displayName).toBe("Cliente de prueba");
    expect(profile.emailVerified).toBe(false);
  });

  it("actualiza el nombre del perfil", async () => {
    const dataSource = {
      query: jest
        .fn()
        .mockResolvedValue([
          { account_id: "11111111-1111-4111-8111-111111111111" },
        ]),
    } as unknown as DataSource;

    const service = new CustomersService(dataSource);

    const result = await service.updateDisplayName(
      "11111111-1111-4111-8111-111111111111",
      "Nuevo nombre",
    );

    expect(result.message).toBe("Nombre del perfil actualizado");
  });
});
