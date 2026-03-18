import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

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
}
