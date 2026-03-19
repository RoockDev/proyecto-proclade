import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListRegionsQueryDto {
  @IsOptional()
  @IsString({ message: 'El criterio de búsqueda debe ser texto' })
  @MaxLength(120, { message: 'El criterio de búsqueda es demasiado largo' })
  search?: string;
}
