import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt_strategy/jwt-auth.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { RoleName } from '../common/types/role-name.enum';
import { CreateSuperheroDto } from './dto/create-superhero.dto';
import { ListSuperheroesQueryDto } from './dto/list-superheroes-query.dto';
import { UpdateSuperheroDto } from './dto/update-superhero.dto';
import { UpdateSuperheroStatusDto } from './dto/update-superhero-status.dto';
import { SuperheroesService } from './superheroes.service';
import type { File as MulterFile } from 'multer';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

const superheroFileFilter = (_req: Request, file, cb) => {
  if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(
    new BadRequestException('Solo se permiten imágenes PNG, JPEG o WEBP'),
    false,
  );
};

const superheroUploadOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
  fileFilter: superheroFileFilter,
};

type RequestWithUser = Request & {
  user: {
    id: number;
  };
};

@Controller('admin/superheroes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminSuperheroesController {
  constructor(private readonly superheroesService: SuperheroesService) {}

  @Get()
  findAll(@Query() query: ListSuperheroesQueryDto) {
    return this.superheroesService.findAllForAdmin(query);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image', superheroUploadOptions))
  create(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
      }),
    )
    createSuperheroDto: CreateSuperheroDto,
    @Req() request: RequestWithUser,
    @UploadedFile() file?: MulterFile,
  ) {
    return this.superheroesService.create(
      createSuperheroDto,
      request.user.id,
      file,
    );
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', superheroUploadOptions))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
        skipMissingProperties: true,
      }),
    )
    updateSuperheroDto: UpdateSuperheroDto,
    @UploadedFile() file?: MulterFile,
  ) {
    return this.superheroesService.update(
      id,
      updateSuperheroDto,
      file,
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateSuperheroStatusDto,
  ) {
    return this.superheroesService.updateStatus(id, updateStatusDto);
  }

  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.superheroesService.restore(id);
  }

  @Delete(':id/permanent')
  removePermanently(@Param('id', ParseIntPipe) id: number) {
    return this.superheroesService.removePermanently(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.superheroesService.remove(id);
  }
}
