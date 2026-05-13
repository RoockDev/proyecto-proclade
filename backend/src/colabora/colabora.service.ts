import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { ContactFormDto } from './dto/contact-form.dto';

@Injectable()
export class ColaboraService {
  constructor(private readonly mailService: MailService) {}

  async sendContactForm(contactData: ContactFormDto): Promise<void> {
    await this.mailService.sendContactEmail(contactData);
  }
}
