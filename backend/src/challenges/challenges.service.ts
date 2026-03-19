import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Challenge, Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { UpdateChallengeAmountDto } from './dto/update-challenge-amount.dto';

@Injectable()
export class ChallengesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForAdmin(): Promise<Challenge[]> {
    return this.prisma.challenge.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateChallengeDto) {
    if (
      dto.currentAmount !== undefined &&
      dto.currentAmount > dto.targetAmount
    ) {
      throw new BadRequestException(
        'El monto actual no puede superar el monto objetivo',
      );
    }

    const challenge = await this.prisma.challenge.create({
      data: {
        title: dto.title,
        description: dto.description,
        targetAmount: dto.targetAmount,
        currentAmount: dto.currentAmount ?? 0,
        isActive: dto.isActive ?? true,
      },
    });

    return {
      message: 'Reto creado correctamente',
      challenge,
    };
  }

  async update(id: number, dto: UpdateChallengeDto) {
    const current = await this.findActiveById(id);
    const updateData: Prisma.ChallengeUpdateInput = {};

    if (dto.title !== undefined) {
      updateData.title = dto.title;
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }

    if (dto.isActive !== undefined) {
      updateData.isActive = dto.isActive;
    }

    const nextTarget = dto.targetAmount ?? current.targetAmount;
    const nextCurrent = dto.currentAmount ?? current.currentAmount;

    if (nextCurrent > nextTarget) {
      throw new BadRequestException(
        'El monto actual no puede superar el monto objetivo',
      );
    }

    if (dto.targetAmount !== undefined) {
      updateData.targetAmount = dto.targetAmount;
    }

    if (dto.currentAmount !== undefined) {
      updateData.currentAmount = dto.currentAmount;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException(
        'Debes enviar al menos un campo para actualizar',
      );
    }

    const challenge = await this.prisma.challenge.update({
      where: { id },
      data: updateData,
    });

    return {
      message: 'Reto actualizado correctamente',
      challenge,
    };
  }

  async updateAmount(id: number, dto: UpdateChallengeAmountDto) {
    const current = await this.findActiveById(id);

    if (dto.currentAmount > current.targetAmount) {
      throw new BadRequestException(
        'El monto actual no puede superar el monto objetivo',
      );
    }

    const challenge = await this.prisma.challenge.update({
      where: { id },
      data: { currentAmount: dto.currentAmount },
    });

    return {
      message: 'Monto actualizado correctamente',
      challenge,
    };
  }

  async remove(id: number) {
    await this.findActiveById(id);

    await this.prisma.challenge.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      message: 'Reto eliminado correctamente',
    };
  }

  private async findActiveById(id: number): Promise<Challenge> {
    const challenge = await this.prisma.challenge.findFirst({
      where: { id, deletedAt: null },
    });

    if (!challenge) {
      throw new NotFoundException(`Reto con id ${id} no encontrado`);
    }

    return challenge;
  }
}
