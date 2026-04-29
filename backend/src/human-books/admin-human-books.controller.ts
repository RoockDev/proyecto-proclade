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
import { CreateHumanBookDto } from './dto/create-human-book.dto';
import { UpdateHumanBookDto } from './dto/update-human-book.dto';
import { type UploadedPdfFile } from './human-book-storage.service';
import { HumanBooksService } from './human-books.service';

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

type RequestWithUser = {
  user: {
    id: number;
  };
};

@Controller('admin/human-books')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminHumanBooksController {
  constructor(private readonly humanBooksService: HumanBooksService) {}

  @Get()
  findAll() {
    return this.humanBooksService.findAllForAdmin();
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('pdf', {
      limits: { fileSize: MAX_PDF_SIZE_BYTES },
    }),
  )
  create(
    @Body() createDto: CreateHumanBookDto,
    @UploadedFile() file: UploadedPdfFile,
    @Req() request: RequestWithUser,
  ) {
    return this.humanBooksService.create(createDto, file, request.user.id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('pdf', {
      limits: { fileSize: MAX_PDF_SIZE_BYTES },
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateHumanBookDto,
    @UploadedFile() file?: UploadedPdfFile,
  ) {
    return this.humanBooksService.update(id, updateDto, file);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.humanBooksService.remove(id);
  }
}
