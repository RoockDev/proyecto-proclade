import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminRegionsController } from './admin-regions.controller';
import { RegionsController } from './regions.controller';
import { RegionsService } from './regions.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminRegionsController, RegionsController],
  providers: [RegionsService],
})
export class RegionsModule {}
