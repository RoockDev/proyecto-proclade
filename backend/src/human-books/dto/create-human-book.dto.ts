import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateHumanBookDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(150, { message: 'El nombre no puede superar 150 caracteres' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MinLength(2, { message: 'El título debe tener al menos 2 caracteres' })
  @MaxLength(200, { message: 'El título no puede superar 200 caracteres' })
  title: string;

  @Type(() => Number)
  @IsInt({ message: 'La delegación debe ser un ID válido' })
  @IsNotEmpty({ message: 'La delegación es obligatoria' })
  regionId: number;
}
