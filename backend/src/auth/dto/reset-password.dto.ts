import { IsNotEmpty, IsString, Matches } from 'class-validator';
import {
  PASSWORD_POLICY_MESSAGE,
  PASSWORD_POLICY_REGEX,
} from '../../common/utils/password-policy';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'El token es obligatorio' })
  token: string;

  @IsString()
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @Matches(PASSWORD_POLICY_REGEX, {
    message: PASSWORD_POLICY_MESSAGE,
  })
  newPassword: string;
}
