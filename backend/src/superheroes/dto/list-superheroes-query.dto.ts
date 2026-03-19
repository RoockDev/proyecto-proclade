import { Type } from 'class-transformer';
import { SuperheroStatus } from 'generated/prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListSuperheroesQueryDto {
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

  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser un texto válido' })
  search?: string;

  @IsOptional()
  @IsEnum(SuperheroStatus, { message: 'El estado es inválido' })
  status?: SuperheroStatus;
}
