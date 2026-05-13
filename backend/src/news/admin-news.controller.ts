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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt_strategy/jwt-auth.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { RoleName } from '../common/types/role-name.enum';
import { CreateNewsDto } from './dto/create-news.dto';
import { DeleteNewsImageDto } from './dto/delete-news-image.dto';
import {
  NewsImageStorageService,
  type UploadedNewsImageFile,
} from './news-image-storage.service';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsService } from './news.service';

const MAX_NEWS_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

type RequestWithUser = {
  user: {
    id: number;
  };
};

@Controller('admin/news')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminNewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly newsImageStorageService: NewsImageStorageService,
  ) {}

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

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_NEWS_IMAGE_SIZE_BYTES,
      },
    }),
  )
  async uploadImage(@UploadedFile() file: UploadedNewsImageFile) {
    const imageUrl = await this.newsImageStorageService.saveNewsImage(file);

    return {
      message: 'Imagen subida correctamente',
      imageUrl,
    };
  }

  @Delete('upload-image')
  async deleteUploadedImage(@Body() deleteNewsImageDto: DeleteNewsImageDto) {
    await this.newsImageStorageService.removeNewsImage(
      deleteNewsImageDto.imageUrl,
    );

    return {
      message: 'Imagen descartada correctamente',
    };
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
