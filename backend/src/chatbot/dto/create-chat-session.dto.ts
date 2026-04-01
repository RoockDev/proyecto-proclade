import { IsOptional, IsUUID } from 'class-validator';

export class CreateChatSessionDto {
  @IsOptional()
  @IsUUID('4', { message: 'El sessionId debe ser un UUID v4 válido' })
  sessionId?: string;
}
