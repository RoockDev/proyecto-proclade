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

    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = Number(this.configService.get<string>('SMTP_PORT') || '587');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (!smtpHost || !smtpUser || !smtpPass) {
      this.logger.warn(
        'SMTP no está configurado. Los correos se simularán en desarrollo y no se enviarán realmente.',
      );
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    } else {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    }
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

  async sendContactEmail(contactData: {
    nombre: string;
    apellidos: string;
    email: string;
    telefono?: string;
    mensaje?: string;
  }): Promise<void> {
    const { nombre, apellidos, email, telefono, mensaje } = contactData;

    const mailOptions = {
      from: this.mailFrom,
      to: 'carlosramii2304@gmail.com', // Destinatario especificado por el usuario
      subject: 'Nuevo mensaje de contacto - Colabora',
      text: `Nuevo mensaje de contacto desde el formulario de colaboración.\n\nNombre: ${nombre}\nApellidos: ${apellidos}\nEmail: ${email}\nTeléfono: ${telefono || 'No proporcionado'}\nMensaje: ${mensaje || 'No proporcionado'}\n\nSistema Proclade`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; background: #f8fafc; color: #1f2937;">
          <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);">
            <div style="background: linear-gradient(135deg, #0f766e 0%, #22c55e 100%); padding: 22px 24px; color: white;">
              <h1 style="margin: 0; font-size: 1.5rem; letter-spacing: -0.02em;">Nuevo mensaje de contacto</h1>
              <p style="margin: 8px 0 0; font-size: 0.95rem; opacity: 0.9;">Un visitante ha completado el formulario de Colabora.</p>
            </div>
            <div style="padding: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tbody>
                  <tr>
                    <td style="padding: 12px 0; font-weight: 700; width: 120px;">Nombre:</td>
                    <td style="padding: 12px 0;">${nombre}</td>
                  </tr>
                  <tr style="background: #f3f4f6;">
                    <td style="padding: 12px 0; font-weight: 700;">Apellidos:</td>
                    <td style="padding: 12px 0;">${apellidos}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; font-weight: 700;">Email:</td>
                    <td style="padding: 12px 0;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
                  </tr>
                  <tr style="background: #f3f4f6;">
                    <td style="padding: 12px 0; font-weight: 700;">Teléfono:</td>
                    <td style="padding: 12px 0;">${telefono || 'No proporcionado'}</td>
                  </tr>
                </tbody>
              </table>

              <div style="margin-top: 24px;">
                <p style="margin: 0 0 8px; font-weight: 700;">Mensaje:</p>
                <div style="background: #f8f9fb; border-radius: 12px; padding: 16px; color: #111827; line-height: 1.7;">
                  ${mensaje ? mensaje.replace(/\n/g, '<br />') : 'No proporcionado'}
                </div>
              </div>

              <p style="margin: 24px 0 0; font-size: 0.9rem; color: #6b7280;">Este correo se generó desde el formulario de colaboración de Equipo PUCH.</p>
            </div>
            <div style="background: #f3f4f6; padding: 18px 24px; font-size: 0.8rem; color: #6b7280; text-align: center;">
              <span>Fundación PROCLADE • Sistema Proclade</span>
            </div>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de contacto enviado desde ${email}`);
    } catch (error) {
      this.logger.error(
        `Error al enviar email de contacto desde ${email}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }
}
