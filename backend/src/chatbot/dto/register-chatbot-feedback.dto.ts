import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsUUID, Min } from 'class-validator';

export class RegisterChatbotFeedbackDto {
  @IsUUID('4', { message: 'El sessionId debe ser un UUID v4 válido' })
  sessionId: string;

  @Type(() => Number)
  @IsInt({ message: 'El messageId debe ser un número entero' })
  @Min(1, { message: 'El messageId debe ser mayor que 0' })
  messageId: number;

  @IsBoolean({ message: 'El campo helpful debe ser true o false' })
  helpful: boolean;
}
