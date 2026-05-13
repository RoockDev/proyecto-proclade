import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { seedChatbotKnowledge } from './seeds/chatbot-knowledge.seed';
import { seedRoles } from './seeds/roles.seed';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

const DEFAULT_ADMIN = {
  email: process.env.SYSTEM_ADMIN_EMAIL?.trim().toLowerCase() || 'admin@equipo-puch.local',
  password: process.env.SYSTEM_ADMIN_PASSWORD?.trim() || 'CambiaEsta123!',
  name: process.env.SYSTEM_ADMIN_NAME?.trim() || 'Administrador',
  surname: process.env.SYSTEM_ADMIN_SURNAME?.trim() || 'Equipo PUCH',
};

async function ensureSystemAdmin() {
  const adminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' },
  });

  if (!adminRole) {
    throw new Error('No se pudo inicializar el administrador porque el rol ADMIN no existe.');
  }

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: DEFAULT_ADMIN.email },
    include: { roles: true },
  });

  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        name: DEFAULT_ADMIN.name,
        surname: DEFAULT_ADMIN.surname,
        deletedAt: null,
        roles: {
          connect: [{ id: adminRole.id }],
        },
      },
    });

    console.log(`   Admin del sistema verificado: ${DEFAULT_ADMIN.email}`);
    return;
  }

  await prisma.user.create({
    data: {
      email: DEFAULT_ADMIN.email,
      passwordHash,
      name: DEFAULT_ADMIN.name,
      surname: DEFAULT_ADMIN.surname,
      roles: {
        connect: [{ id: adminRole.id }],
      },
    },
  });

  console.log(`   Admin del sistema creado: ${DEFAULT_ADMIN.email}`);
}

async function main() {
  console.log('Inicializando datos base del sistema...\n');
  console.log('='.repeat(50));

  await seedRoles(prisma);
  await ensureSystemAdmin();
  await seedChatbotKnowledge(prisma);

  console.log('='.repeat(50));
  console.log('Inicialización completada correctamente.\n');
  console.log('Resumen:');
  console.log('   - Roles base: ADMIN, USER');
  console.log(`   - Admin del sistema: ${DEFAULT_ADMIN.email}`);
  console.log('   - Base del chatbot cargada');
  console.log('\nImportante: cambia la contraseña del administrador tras el primer acceso si mantienes los valores por defecto.');
}

main()
  .catch((error) => {
    console.error('La inicialización del sistema ha fallado.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
