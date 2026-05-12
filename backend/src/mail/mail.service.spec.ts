import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailService } from './mail.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

describe('MailService', () => {
  const createConfigService = (values: Record<string, string | undefined>) =>
    ({
      get: jest.fn((key: string) => values[key]),
    }) as unknown as ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('envia el formulario de contacto al destinatario configurado', async () => {
    const sendMail = jest.fn().mockResolvedValue(undefined);

    jest.mocked(nodemailer.createTransport).mockReturnValue({
      sendMail,
    } as never);

    const service = new MailService(
      createConfigService({
        SMTP_HOST: 'smtp.gmail.com',
        SMTP_PORT: '587',
        SMTP_USER: 'sender@example.com',
        SMTP_PASS: 'secret',
        MAIL_FROM: 'sender@example.com',
        CONTACT_FORM_TO: 'info@fundacionproclade.org',
        FRONTEND_URL: 'http://localhost',
      }),
    );

    await service.sendContactEmail({
      nombre: 'Ana',
      apellidos: 'Lopez',
      email: 'ana@example.com',
      telefono: '600123123',
      mensaje: 'Quiero ayudar',
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'sender@example.com',
        to: 'info@fundacionproclade.org',
        subject: 'Nuevo mensaje de contacto - Colabora',
      }),
    );
  });

  it('rechaza el formulario de contacto cuando falta SMTP', async () => {
    const sendMail = jest.fn().mockResolvedValue(undefined);

    jest.mocked(nodemailer.createTransport).mockReturnValue({
      sendMail,
    } as never);

    const service = new MailService(
      createConfigService({
        MAIL_FROM: 'sender@example.com',
        CONTACT_FORM_TO: 'info@fundacionproclade.org',
        FRONTEND_URL: 'http://localhost',
      }),
    );

    await expect(
      service.sendContactEmail({
        nombre: 'Ana',
        apellidos: 'Lopez',
        email: 'ana@example.com',
      }),
    ).rejects.toThrow('SMTP no está configurado para el formulario de contacto');

    expect(sendMail).not.toHaveBeenCalled();
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      jsonTransport: true,
    });
  });
});
