import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Account } from "./entities/account.entity";
import { Credential } from "./entities/credential.entity";
import { IdentityController } from "./identity.controller";
import { IdentityService } from "./identity.service";

@Module({
  imports: [TypeOrmModule.forFeature([Account, Credential])],
  controllers: [IdentityController],
  providers: [IdentityService],
})
export class IdentityModule {}
