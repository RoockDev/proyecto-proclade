import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El correo no es válido' })
  @IsNotEmpty({message: 'El email es obligatorio'})
  email: string;

  @IsString()
  @IsNotEmpty({message: 'La contraseña es obligatoria'})
  @MinLength(6, {message: 'Mnimo 6 caracteres'})
  password: string;
}