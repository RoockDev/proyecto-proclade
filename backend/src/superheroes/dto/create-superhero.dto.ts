import { Type } from 'class-transformer';
import { SuperheroStatus } from 'generated/prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateSuperheroDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MinLength(40, {
    message: 'La descripción debe tener al menos 40 caracteres',
  })
  description: string;

  @IsOptional()
  @IsString({ message: 'La frase debe ser un texto válido' })
  @MaxLength(250, { message: 'La frase no puede superar 250 caracteres' })
  quote?: string;

  @IsOptional()
  @IsString({ message: 'El país debe ser un texto válido' })
  @MaxLength(120, { message: 'El país no puede superar 120 caracteres' })
  country?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(0, { message: 'El orden mínimo es 0' })
  sortOrder?: number;

  @IsOptional()
  @IsEnum(SuperheroStatus, { message: 'El estado es inválido' })
  status?: SuperheroStatus;

  @IsOptional()
  @IsString({ message: 'La imagen debe ser un texto válido' })
  imageUrl?: string;
}
