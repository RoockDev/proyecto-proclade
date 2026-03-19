import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly mailFrom: string;
  private readonly frontendUrl: string;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    this.mailFrom =
      this.configService.get<string>('MAIL_FROM') || 'noreply@proclade.org';
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: Number(this.configService.get<string>('SMTP_PORT') || '587'),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendResetPasswordEmail(email: string, token: string): Promise<void> {
    const resetLink = `${this.frontendUrl}/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: this.mailFrom,
      to: email,
      subject: 'Recuperación de contraseña - Proclade',
      text: `
Hola,

Has solicitado restablecer tu contraseña.

Haz clic en el siguiente enlace para crear una nueva contraseña:
${resetLink}

Este enlace expirará en ${this.configService.get<string>('RESET_PASSWORD_TTL_MINUTES') || '30'} minutos.

Si no solicitaste este cambio, puedes ignorar este correo.

Un saludo,
Equipo Proclade
      `.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Recuperación de contraseña</h2>
          <p>Hola,</p>
          <p>Has solicitado restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}"
               style="background-color: #0d6efd; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 6px; font-weight: bold;">
              Restablecer contraseña
            </a>
          </p>
          <p style="font-size: 0.9em; color: #666;">
            Este enlace expirará en ${this.configService.get<string>('RESET_PASSWORD_TTL_MINUTES') || '30'} minutos.
          </p>
          <p style="font-size: 0.9em; color: #666;">
            Si no solicitaste este cambio, puedes ignorar este correo.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 0.8em; color: #999;">Equipo Proclade</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de recuperación enviado a ${email}`);
    } catch (error) {
      this.logger.error(
        `Error al enviar email de recuperación a ${email}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }
}
