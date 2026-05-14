import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminSuperheroesController } from './admin-superheroes.controller';
import { SuperheroImageStorageService } from './superhero-image-storage.service';
import { SuperheroesController } from './superheroes.controller';
import { SuperheroesService } from './superheroes.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SuperheroesController, AdminSuperheroesController],
  providers: [SuperheroesService, SuperheroImageStorageService],
})
export class SuperheroesModule {}
