import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class UpdateChallengeAmountDto {
  @Type(() => Number)
  @IsInt({ message: 'El monto debe ser un número entero' })
  @Min(0, { message: 'El monto no puede ser negativo' })
  currentAmount: number;
}
