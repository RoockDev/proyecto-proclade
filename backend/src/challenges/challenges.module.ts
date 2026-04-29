import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminChallengesController } from './admin-challenges.controller';
import { ChallengesService } from './challenges.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminChallengesController],
  providers: [ChallengesService],
})
export class ChallengesModule {}
