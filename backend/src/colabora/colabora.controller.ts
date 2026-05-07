import { Body, Controller, Post } from '@nestjs/common';
import { ColaboraService } from './colabora.service';

@Controller('colabora')
export class ColaboraController {
  constructor(private readonly colaboraService: ColaboraService) {}

  @Post('contact')
  async sendContactForm(
    @Body() body: {
      nombre: string;
      apellidos: string;
      email: string;
      telefono?: string;
      mensaje?: string;
    },
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.colaboraService.sendContactForm(body);
      return { success: true, message: 'Mensaje enviado correctamente' };
    } catch (error) {
      return { success: false, message: 'Error al enviar el mensaje' };
    }
  }
}