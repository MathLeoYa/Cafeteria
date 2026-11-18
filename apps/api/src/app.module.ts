import { IdentityModule } from "./identity/identity.module";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HealthController } from "./health/health.controller";

@Module({
  imports: [
    IdentityModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres" as const,
        host: config.getOrThrow<string>("DB_HOST"),
        port: Number(config.getOrThrow<string>("DB_PORT")),
        username: config.getOrThrow<string>("DB_USERNAME"),
        password: config.getOrThrow<string>("DB_PASSWORD"),
        database: config.getOrThrow<string>("DB_DATABASE"),
        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: false,
        retryAttempts: 2,
        retryDelay: 1000,
      }),
    }),
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
