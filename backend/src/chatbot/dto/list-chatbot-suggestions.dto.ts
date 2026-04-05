import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MaxLength,
} from 'class-validator';

export class ListChatbotSuggestionsDto {
  @IsOptional()
  @IsUUID('4', { message: 'El sessionId debe ser un UUID v4 válido' })
  sessionId?: string;

  @IsOptional()
  @IsString({ message: 'El contexto de página debe ser texto válido' })
  @MaxLength(160, {
    message: 'El contexto de página no puede superar 160 caracteres',
  })
  pageContext?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite mínimo es 1' })
  @Max(8, { message: 'El límite máximo es 8' })
  limit?: number;
}
