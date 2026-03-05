import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListNewsQueryDto } from './dto/list-news-query.dto';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  findAllPublished(@Query() query: ListNewsQueryDto) {
    return this.newsService.findAllPublished(query);
  }

  @Get(':slug')
  findPublishedBySlug(@Param('slug') slug: string) {
    return this.newsService.findPublishedBySlug(slug);
  }
}
