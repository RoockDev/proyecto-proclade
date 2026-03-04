import { PartialType } from '@nestjs/mapped-types';
import { CreateNewsDto } from './create-news.dto';

export class UpdateNewsDto extends PartialType(CreateNewsDto) {}
//con PartialType mismo campos que CreateNewsDto pero todos opcionales, muy chulo esto
