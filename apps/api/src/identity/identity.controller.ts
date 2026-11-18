import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { IdentityService } from "./identity.service";
import { EmailVerificationService } from "./email-verification.service";

@Controller("auth")
export class IdentityController {
  constructor(
    private readonly identityService: IdentityService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Post("register")
  @HttpCode(HttpStatus.ACCEPTED)
  register(@Body() dto: RegisterDto): Promise<{ message: string }> {
    return this.identityService.register(dto);
  }

  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Body() dto: VerifyEmailDto): Promise<{ message: string }> {
    return this.emailVerificationService.verify(dto.token);
  }
}
