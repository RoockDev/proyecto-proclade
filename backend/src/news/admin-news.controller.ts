import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt_strategy/jwt-auth.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { RoleName } from '../common/types/role-name.enum';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsService } from './news.service';

type RequestWithUser = {
  user: {
    id: number;
  };
};

@Controller('admin/news')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminNewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  findAllForAdmin() {
    return this.newsService.findAllForAdmin();
  }

  @Post()
  create(
    @Body() createNewsDto: CreateNewsDto,
    @Req() request: RequestWithUser,
  ) {
    return this.newsService.create(createNewsDto, request.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNewsDto: UpdateNewsDto,
  ) {
    return this.newsService.update(id, updateNewsDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.remove(id);
  }
}
