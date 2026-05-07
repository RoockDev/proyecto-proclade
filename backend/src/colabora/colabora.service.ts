import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ColaboraService {
  constructor(private readonly mailService: MailService) {}

  async sendContactForm(contactData: {
    nombre: string;
    apellidos: string;
    email: string;
    telefono?: string;
    mensaje?: string;
  }): Promise<void> {
    await this.mailService.sendContactEmail(contactData);
  }
}