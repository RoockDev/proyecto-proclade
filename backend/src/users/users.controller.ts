import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ToggleRealHeroDto } from './dto/toggle-real-hero.dto';
import { JwtAuthGuard } from '../auth/jwt_strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { RoleName } from '../common/types/role-name.enum';

type RequestWithUser = {
  user: {
    id: number;
  };
};

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query('includeDeleted') includeDeleted?: string) {
    const include = includeDeleted === 'true';
    return this.usersService.findAll(include);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Post(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.restore(id);
  }

  @Patch(':id/real-hero')
  setRealHero(
    @Param('id', ParseIntPipe) id: number,
    @Body() toggleRealHeroDto: ToggleRealHeroDto,
    @Req() request: RequestWithUser,
  ) {
    return this.usersService.setRealHeroStatus(
      id,
      toggleRealHeroDto.enabled,
      request.user.id,
    );
  }
}
