import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class CreateIntentPhraseDto {
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

export class CreateIntentDto {
  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIntentPhraseDto)
  phrases?: CreateIntentPhraseDto[];
}
