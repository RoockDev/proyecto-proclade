import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleSignInDto {
  @IsString()
  @IsNotEmpty({ message: 'Solicitud inválida' })
  idToken: string;
}
