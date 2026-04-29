import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt_strategy/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

type RequestWithUser = {
  user: {
    id: number;
  };
};

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class UsersProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findMyProfile(@Req() request: RequestWithUser) {
    return this.usersService.findProfileById(request.user.id);
  }

  @Patch()
  updateMyProfile(
    @Req() request: RequestWithUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfileById(
      request.user.id,
      updateProfileDto,
    );
  }
}
