/**
 * Orquestador principal de seeds.
 * Ejecuta todos los seeds en orden.
 * 
 * Uso: yarn prisma:seed
 */

import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { seedRoles } from './roles.seed';
import { seedAdminUser } from './admin-user.seed';
import { seedUsersBatch } from './users-batch.seed';
import { seedChatbotKnowledge } from './chatbot-knowledge.seed';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

async function main() {
  console.log('Iniciando proceso de seeding...\n');
  console.log('='.repeat(50));

  // 1. Seed de roles base (ADMIN, USER)
  await seedRoles(prisma);

  // 2. Seed de usuarios base (admin + user genérico)
  await seedAdminUser(prisma);

  // 3. Seed de batch de usuarios fake
  await seedUsersBatch(prisma);

  // 4. Seed base de chatbot (HU-39)
  await seedChatbotKnowledge(prisma);

  console.log('='.repeat(50));
  console.log('Seeding completado exitosamente!\n');
  console.log('Resumen de datos creados:');
  console.log('   - Roles: ADMIN, USER');
  console.log('   - Admin: admin@proclade.local');
  console.log('   - User: user@proclade.local');
  console.log('   - Batch: 20 usuarios fake (test.user.XXX@test.com)');
  console.log('   - Chatbot: intents, frases y knowledge inicial');
  console.log('\nTip: Las contraseñas de prueba son:');
  console.log('   - Admin: Admin123!');
  console.log('   - User: User123!');
  console.log('   - Batch: Test123!');
}

main()
  .catch((e) => {
    console.error('Seed failed', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\nConexion a base de datos cerrada.');
  });
