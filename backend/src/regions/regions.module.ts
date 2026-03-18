import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminRegionsController } from './admin-regions.controller';
import { RegionsService } from './regions.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminRegionsController],
  providers: [RegionsService],
})
export class RegionsModule {}
