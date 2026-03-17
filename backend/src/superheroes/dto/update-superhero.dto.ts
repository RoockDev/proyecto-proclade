import { PartialType } from '@nestjs/mapped-types';
import { CreateSuperheroDto } from './create-superhero.dto';

export class UpdateSuperheroDto extends PartialType(CreateSuperheroDto) {}
