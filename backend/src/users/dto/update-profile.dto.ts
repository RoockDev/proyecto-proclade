import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(80, {
    message: 'El nombre no puede superar los 80 caracteres',
  })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  @MaxLength(120, {
    message: 'Los apellidos no pueden superar los 120 caracteres',
  })
  surname: string;
}
