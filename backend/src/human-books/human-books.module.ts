import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminHumanBooksController } from './admin-human-books.controller';
import { HumanBookStorageService } from './human-book-storage.service';
import { HumanBooksController } from './human-books.controller';
import { HumanBooksService } from './human-books.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [HumanBooksController, AdminHumanBooksController],
  providers: [HumanBooksService, HumanBookStorageService],
})
export class HumanBooksModule {}
