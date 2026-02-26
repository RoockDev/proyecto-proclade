/**
 * Seed de roles base del sistema.
 * Crea/actualiza los roles ADMIN y USER mediante upsert (idempotente).
 */

import type { PrismaClient } from '../../generated/prisma/client';

const ROLES = ['ADMIN', 'USER'];

export async function seedRoles(prisma: PrismaClient) {
  console.log('Seeding roles...');

  for (const roleName of ROLES) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    console.log(`   Role "${roleName}" creado/verificado`);
  }

  console.log('Roles seeding completado\n');
}
