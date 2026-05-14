import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateRegionDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede superar 100 caracteres' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @MinLength(6, { message: 'La dirección debe tener al menos 6 caracteres' })
  @MaxLength(200, { message: 'La dirección no puede superar 200 caracteres' })
  address: string;

  @IsEmail({}, { message: 'El email no es válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @MaxLength(120, { message: 'El email no puede superar 120 caracteres' })
  email: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto' })
  @Matches(/^(?:\d{9}|\d{3}(?:\s\d{2}){3})$/, {
    message: 'El teléfono debe tener exactamente 9 dígitos',
  })
  @MaxLength(12, { message: 'El teléfono no puede superar 12 caracteres' })
  phone?: string;
}
