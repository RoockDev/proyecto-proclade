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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
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

const SUPERHERO_UPLOAD_PATH = join(process.cwd(), 'uploads', 'superheroes');
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const IMAGE_URL_PREFIX = '/uploads/superheroes';

const superheroStorage = diskStorage({
  destination: (_req, _file, cb) => {
    if (!existsSync(SUPERHERO_UPLOAD_PATH)) {
      mkdirSync(SUPERHERO_UPLOAD_PATH, { recursive: true });
    }
    cb(null, SUPERHERO_UPLOAD_PATH);
  },
  filename: (req: Request, file, cb) => {
    const rawBaseName =
      (req.body?.name as string) ?? file.originalname ?? 'superheroe';
    const sanitizedBase = rawBaseName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const safeBase = sanitizedBase || 'superheroe';
    const timestamp = Date.now();
    const randomPart = Math.floor(Math.random() * 9000 + 1000);
    const extension = extname(file.originalname).toLowerCase() || '.png';
    cb(null, `${timestamp}-${safeBase}-${randomPart}${extension}`);
  },
});

const superheroFileFilter = (_req: Request, file, cb) => {
  if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(
    new BadRequestException(
      'Solo se permiten imágenes PNG, JPEG o WEBP',
    ),
    false,
  );
};

const superheroUploadOptions = {
  storage: superheroStorage,
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
    @Body() createSuperheroDto: CreateSuperheroDto,
    @Req() request: RequestWithUser,
    @UploadedFile() file?: MulterFile,
  ) {
    return this.superheroesService.create(
      createSuperheroDto,
      request.user.id,
      this.buildFileUrl(file),
    );
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', superheroUploadOptions))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSuperheroDto: UpdateSuperheroDto,
    @UploadedFile() file?: MulterFile,
  ) {
    return this.superheroesService.update(
      id,
      updateSuperheroDto,
      this.buildFileUrl(file),
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

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.superheroesService.remove(id);
  }

  private buildFileUrl(file?: MulterFile): string | undefined {
    if (!file) {
      return undefined;
    }

    return `${IMAGE_URL_PREFIX}/${file.filename}`;
  }
}
