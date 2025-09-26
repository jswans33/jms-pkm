import { PrismaClient } from '@prisma/client';

import { seedUsers } from './seeds/users.seed';

const prisma = new PrismaClient();

const main = async (): Promise<void> => {
  const environment = process.env['NODE_ENV'] ?? 'development';
  console.log(`🌱 Starting database seeding for environment: ${environment}`);
  console.log('=====================================');

  try {
    // Seed users
    await seedUsers(prisma);

    // Future: Add more seeders here as contexts grow
    // await seedProjects(prisma);
    // await seedTasks(prisma);
    // await seedNotes(prisma);

    console.log('=====================================');
    console.log('✅ Database seeding completed successfully');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

main()
  .catch((error) => {
    console.error('Fatal error during seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });