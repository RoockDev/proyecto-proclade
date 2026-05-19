import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { ColaboraController } from './colabora.controller';
import { ColaboraService } from './colabora.service';

@Module({
  imports: [MailModule],
  controllers: [ColaboraController],
  providers: [ColaboraService],
})
export class ColaboraModule {}