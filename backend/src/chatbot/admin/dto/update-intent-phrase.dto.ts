import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateIntentPhraseDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  @Type(() => Number)
  weight?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
