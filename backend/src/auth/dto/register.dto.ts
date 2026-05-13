import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import {
  PASSWORD_POLICY_MESSAGE,
  PASSWORD_POLICY_REGEX,
} from '../../common/utils/password-policy';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  surname: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @Matches(PASSWORD_POLICY_REGEX, {
    message: PASSWORD_POLICY_MESSAGE,
  })
  password: string;
}
