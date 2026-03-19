import { PartialType } from '@nestjs/mapped-types';
import { Allow } from 'class-validator';
import { CreateSuperheroDto } from './create-superhero.dto';

export class UpdateSuperheroDto extends PartialType(CreateSuperheroDto) {
  @Allow()
  image?: unknown;
}
