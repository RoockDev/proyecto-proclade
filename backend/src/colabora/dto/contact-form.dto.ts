import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const trimOptionalString = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export class ContactFormDto {
  @Transform(trimString)
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(80, { message: 'El nombre no puede superar 80 caracteres' })
  nombre: string;

  @Transform(trimString)
  @IsString({ message: 'Los apellidos deben ser texto' })
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  @MaxLength(120, { message: 'Los apellidos no pueden superar 120 caracteres' })
  apellidos: string;

  @Transform(trimString)
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @MaxLength(160, { message: 'El correo electrónico no puede superar 160 caracteres' })
  email: string;

  @Transform(trimOptionalString)
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto' })
  @MaxLength(30, { message: 'El teléfono no puede superar 30 caracteres' })
  @Matches(/^[0-9+\s().-]+$/, {
    message: 'El teléfono solo puede contener números, espacios y símbolos básicos',
  })
  telefono?: string;

  @Transform(trimOptionalString)
  @IsOptional()
  @IsString({ message: 'El mensaje debe ser texto' })
  @MaxLength(2000, { message: 'El mensaje no puede superar 2000 caracteres' })
  mensaje?: string;
}
