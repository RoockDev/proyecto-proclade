/**
 * Seed de usuarios fake para pruebas de CRUD.
 * Crea 20 usuarios con datos generados usando @faker-js/faker.
 * Usa semilla fija para reproducibilidad.
 * Idempotente mediante upsert por email.
 */

import type { PrismaClient } from '../../generated/prisma/client';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

const SALT_ROUNDS = 10;
const BATCH_SIZE = 20;
const EMAIL_DOMAIN = 'test.com';
const FAKER_SEED = 12345;
const DEFAULT_PASSWORD = 'Test123!';

/**
 * Genera un email único basado en índice
 */
function generateEmail(index: number): string {
  const paddedIndex = String(index).padStart(3, '0');
  return `test.user.${paddedIndex}@${EMAIL_DOMAIN}`;
}

export async function seedUsersBatch(prisma: PrismaClient) {
  console.log(`Seeding batch de ${BATCH_SIZE} usuarios fake...`);

  faker.seed(FAKER_SEED);
  console.log('   Usando @faker-js/faker para datos realistas');

  // Buscar rol USER
  const userRole = await prisma.role.findUnique({
    where: { name: 'USER' },
  });

  if (!userRole) {
    console.error('   Rol "USER" no encontrado. Ejecuta roles.seed primero.');
    return;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  for (let i = 1; i <= BATCH_SIZE; i++) {
    const email = generateEmail(i);
    const name = faker.person.firstName();
    const surname = faker.person.lastName();

    await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash,
        name,
        surname,
        roles: {
          set: [{ id: userRole.id }],
        },
      },
      create: {
        email,
        passwordHash,
        name,
        surname,
        roles: {
          connect: [{ id: userRole.id }],
        },
      },
    });

    console.log(`   [${i}/${BATCH_SIZE}] ${email} - ${name} ${surname}`);
  }

  console.log(`Batch de ${BATCH_SIZE} usuarios seeding completado\n`);
}
