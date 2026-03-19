import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { HumanBooksModule } from './human-books/human-books.module';
import { NewsModule } from './news/news.module';
import { PrismaModule } from './prisma/prisma.module';
import { RegionsModule } from './regions/regions.module';
import { SuperheroesModule } from './superheroes/superheroes.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    PrismaModule,
    UsersModule,
    NewsModule,
    RegionsModule,
    SuperheroesModule,
    HumanBooksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
