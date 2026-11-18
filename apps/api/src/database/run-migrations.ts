import { AppDataSource } from "./data-source";

async function main(): Promise<void> {
  try {
    await AppDataSource.initialize();

    const migrations = await AppDataSource.runMigrations({
      transaction: "all",
    });

    console.log(`Migraciones aplicadas: ${migrations.length}`);

    for (const migration of migrations) {
      console.log(`- ${migration.name}`);
    }
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

main().catch((error: unknown) => {
  console.error("Error al ejecutar las migraciones:", error);
  process.exitCode = 1;
});
