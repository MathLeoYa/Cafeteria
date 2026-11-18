import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  constructor(private readonly config: ConfigService) {}

  async sendVerificationEmail(recipient: string, token: string): Promise<void> {
    const host = this.config.getOrThrow<string>("SMTP_HOST");
    const port = Number(this.config.getOrThrow<string>("SMTP_PORT"));
    const frontendUrl = this.config.getOrThrow<string>("FRONTEND_URL");

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
    });

    const verificationUrl = new URL("/verificar-correo", frontendUrl);
    verificationUrl.searchParams.set("token", token);

    try {
      await transporter.sendMail({
        from: '"Cafetería" <no-reply@cafeteria.test>',
        to: recipient,
        subject: "Verifica tu correo electrónico",
        text: [
          "Gracias por registrarte en Cafetería.",
          "",
          "Para verificar tu correo, visita este enlace:",
          verificationUrl.toString(),
          "",
          "Si no solicitaste esta cuenta, ignora el mensaje.",
        ].join("\n"),
      });
    } catch {
      throw new InternalServerErrorException(
        "No se pudo enviar el correo de verificación",
      );
    } finally {
      transporter.close();
    }
  }
}
