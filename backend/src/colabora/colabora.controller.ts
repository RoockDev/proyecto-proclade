import { Body, Controller, Post } from '@nestjs/common';
import { ColaboraService } from './colabora.service';
import { ContactFormDto } from './dto/contact-form.dto';

@Controller('colabora')
export class ColaboraController {
  constructor(private readonly colaboraService: ColaboraService) {}

  @Post('contact')
  async sendContactForm(
    @Body() body: ContactFormDto,
  ): Promise<{ message: string }> {
    await this.colaboraService.sendContactForm(body);
    return { message: 'Mensaje enviado correctamente' };
  }
}
