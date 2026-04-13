import { IsBoolean } from 'class-validator';

export class ToggleRealHeroDto {
  @IsBoolean()
  enabled!: boolean;
}
