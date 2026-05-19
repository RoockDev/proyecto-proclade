import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class ListRegionsQueryDto {
  @IsOptional()
  @IsString({ message: 'El criterio de búsqueda debe ser texto' })
  @MaxLength(120, { message: 'El criterio de búsqueda es demasiado largo' })
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página mínima es 1' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El tamaño de página debe ser un número entero' })
  @Min(1, { message: 'El tamaño de página mínimo es 1' })
  @Max(100, { message: 'El tamaño de página máximo es 100' })
  pageSize?: number;
}
