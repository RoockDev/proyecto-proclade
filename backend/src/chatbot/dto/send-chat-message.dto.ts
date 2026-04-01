import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class SendChatMessageDto {
  @IsOptional()
  @IsUUID('4', { message: 'El sessionId debe ser un UUID v4 válido' })
  sessionId?: string;

  @IsString({ message: 'El mensaje debe ser texto' })
  @IsNotEmpty({ message: 'El mensaje no puede estar vacío' })
  @MaxLength(1200, {
    message: 'El mensaje no puede superar 1200 caracteres',
  })
  message: string;

  @IsOptional()
  @IsString({ message: 'El contexto de página debe ser texto válido' })
  @MaxLength(160, {
    message: 'El contexto de página no puede superar 160 caracteres',
  })
  pageContext?: string;
}
