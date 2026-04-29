import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListSuperheroesQueryDto } from './dto/list-superheroes-query.dto';
import { SuperheroesService } from './superheroes.service';

@Controller('superheroes')
export class SuperheroesController {
  constructor(private readonly superheroesService: SuperheroesService) {}

  @Get()
  findAll(@Query() query: ListSuperheroesQueryDto) {
    return this.superheroesService.findAllPublished(query);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.superheroesService.findPublishedBySlug(slug);
  }
}
