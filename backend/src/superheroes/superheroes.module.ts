import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminSuperheroesController } from './admin-superheroes.controller';
import { SuperheroesController } from './superheroes.controller';
import { SuperheroesService } from './superheroes.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SuperheroesController, AdminSuperheroesController],
  providers: [SuperheroesService],
})
export class SuperheroesModule {}
