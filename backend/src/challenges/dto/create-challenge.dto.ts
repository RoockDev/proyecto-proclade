import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateChallengeDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  description: string;

  @Type(() => Number)
  @IsInt({ message: 'El monto objetivo debe ser un número entero' })
  @Min(1, { message: 'El monto objetivo debe ser mayor que 0' })
  targetAmount: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El monto actual debe ser un número entero' })
  @Min(0, { message: 'El monto actual no puede ser negativo' })
  currentAmount?: number;

  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  isActive?: boolean;
}
