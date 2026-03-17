import { SuperheroStatus } from 'generated/prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateSuperheroStatusDto {
  @IsEnum(SuperheroStatus, { message: 'El estado es inválido' })
  status: SuperheroStatus;
}
