import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UsersProfileController } from './users-profile.controller';
@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [UsersController, UsersProfileController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
