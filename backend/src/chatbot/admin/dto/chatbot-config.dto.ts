import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class ChatbotWeightsDto {
  @IsNumber()
  @Min(0)
  @Max(1)
  keyword!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  fuzzy!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  semantic!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  context!: number;
}

class ChatbotThresholdsDto {
  @IsNumber()
  @Min(0)
  @Max(1)
  directAnswer!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  clarification!: number;
}

export class UpdateChatbotConfigDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ChatbotWeightsDto)
  weights?: ChatbotWeightsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChatbotThresholdsDto)
  thresholds?: ChatbotThresholdsDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  fuzzyInternalMin?: number;
}
