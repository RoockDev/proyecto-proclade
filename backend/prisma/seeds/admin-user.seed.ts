/**
 * Seed de usuarios base: admin genérico y usuario normal de pruebas.
 * Usa upsert para idempotencia.
 */

import type { PrismaClient } from '../../generated/prisma/client';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

const BASE_USERS = [
  {
    email: 'admin@proclade.local',
    password: 'Admin123!',
    name: 'Admin',
    surname: 'Sistema',
    roleName: 'ADMIN',
  },
  {
    email: 'user@proclade.local',
    password: 'User123!',
    name: 'Usuario',
    surname: 'Pruebas',
    roleName: 'USER',
  },
];

export async function seedAdminUser(prisma: PrismaClient) {
  console.log('Seeding usuarios base (admin + user)...');

  for (const userData of BASE_USERS) {
    const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

    // Buscar el rol
    const role = await prisma.role.findUnique({
      where: { name: userData.roleName },
    });

    if (!role) {
      console.error(`   Rol "${userData.roleName}" no encontrado. Ejecuta roles.seed primero.`);
      continue;
    }

    await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        passwordHash,
        name: userData.name,
        surname: userData.surname,
        roles: {
          set: [{ id: role.id }],
        },
      },
      create: {
        email: userData.email,
        passwordHash,
        name: userData.name,
        surname: userData.surname,
        roles: {
          connect: [{ id: role.id }],
        },
      },
    });

    console.log(`   Usuario "${userData.email}" (${userData.roleName}) creado/actualizado`);
  }

  console.log('Usuarios base seeding completado\n');
}
