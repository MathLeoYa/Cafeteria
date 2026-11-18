import { CreateEmailVerificationTokens1763481600002 } from "./migrations/1763481600002-CreateEmailVerificationTokens";
import { CreateIdentityAccounts1763481600001 } from "./migrations/1763481600001-CreateIdentityAccounts";
import { DataSource } from "typeorm";
import { CreateIdentityAndCustomersSchemas1763481600000 } from "./migrations/1763481600000-CreateIdentityAndCustomersSchemas";

const required = [
  "DB_HOST",
  "DB_PORT",
  "DB_USERNAME",
  "DB_PASSWORD",
  "DB_DATABASE",
];

for (const name of required) {
  if (!process.env[name]) {
    throw new Error(`Falta la variable de entorno: ${name}`);
  }
}

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  migrationsTableName: "typeorm_migrations",
  migrations: [
    CreateIdentityAndCustomersSchemas1763481600000,
    CreateIdentityAccounts1763481600001,
    CreateEmailVerificationTokens1763481600002,
  ],
});
