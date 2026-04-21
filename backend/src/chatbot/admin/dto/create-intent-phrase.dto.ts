import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateIntentPhraseDto {
  @IsString()
  text!: string;

  @IsOptional()
  @IsString()
  language: string = 'es';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  @Type(() => Number)
  weight: number = 1;

  @IsOptional()
  @IsBoolean()
  isActive: boolean = true;
}
