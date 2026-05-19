import { NewsStatus } from 'generated/prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'El resumen es obligatorio' })
  @MaxLength(280, { message: 'El resumen no puede superar 280 caracteres' })
  excerpt: string;

  @IsString()
  @IsNotEmpty({ message: 'El contenido es obligatorio' })
  content: string;

  @IsOptional()
  @IsString({ message: 'La imagen debe ser un texto válido' })
  imageUrl?: string;

  @IsOptional()
  @IsEnum(NewsStatus, { message: 'El estado de noticia es inválido' })
  status?: NewsStatus;
}
