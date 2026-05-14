import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class DeleteNewsImageDto {
  @IsString({ message: 'La URL de la imagen debe ser texto' })
  @IsNotEmpty({ message: 'La URL de la imagen es obligatoria' })
  @MaxLength(500, { message: 'La URL de la imagen es demasiado larga' })
  imageUrl: string;
}
