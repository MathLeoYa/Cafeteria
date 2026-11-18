import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { IdentityService } from "./identity.service";

@Controller("auth")
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Post("register")
  @HttpCode(HttpStatus.ACCEPTED)
  register(@Body() dto: RegisterDto): Promise<{ message: string }> {
    return this.identityService.register(dto);
  }
}
