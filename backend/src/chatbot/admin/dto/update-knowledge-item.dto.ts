import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ChatbotCtaLinkDto } from './create-knowledge-item.dto';

export class UpdateKnowledgeItemDto {
  @IsOptional()
  @IsString()
  questionCanonical?: string;

  @IsOptional()
  @IsString()
  answer?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  intentId?: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  route?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatbotCtaLinkDto)
  ctaLinks?: ChatbotCtaLinkDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
