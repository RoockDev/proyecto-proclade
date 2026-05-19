import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { ChatbotAdminModule } from './chatbot/admin/chatbot-admin.module';
import { ChallengesModule } from './challenges/challenges.module';
import { ColaboraModule } from './colabora/colabora.module';
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
    ChatbotModule,
    ChatbotAdminModule,
    RegionsModule,
    SuperheroesModule,
    HumanBooksModule,
    ChallengesModule,
    ColaboraModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
