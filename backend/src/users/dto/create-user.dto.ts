import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { RoleName } from '../../common/types/role-name.enum';

export class CreateUserDto {
  @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  surname: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;

  @IsOptional()
  @IsEnum(RoleName, { each: true, message: 'Se ha proporcionado un rol inválido' })
  roles?: RoleName[];
}