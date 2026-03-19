import { PartialType } from '@nestjs/mapped-types';
import { CreateHumanBookDto } from './create-human-book.dto';

export class UpdateHumanBookDto extends PartialType(CreateHumanBookDto) {}
