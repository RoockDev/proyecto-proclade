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

export class ChatbotCtaLinkDto {
  @IsString()
  label!: string;

  @IsString()
  to!: string;
}

export class CreateKnowledgeItemDto {
  @IsString()
  questionCanonical!: string;

  @IsString()
  answer!: string;

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

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  unresolvedQuestionId?: number;
}
