import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminNewsController } from './admin-news.controller';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [NewsController, AdminNewsController],
  providers: [NewsService],
})
export class NewsModule {}
