import type { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { BaseSeeder } from './base.seeder';

const BCRYPT_ROUNDS = 10;

interface ISeedUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly passwordHash?: string;
  readonly status: 'active' | 'invited' | 'disabled';
}

export class UserSeeder extends BaseSeeder {
  public constructor(prisma: PrismaClient) {
    super(prisma);
  }

  public getName(): string {
    return 'UserSeeder';
  }

  public async run(): Promise<void> {
    this.log(`Starting user seeding for environment: ${this.config.environment}`);

    const users = this.getUsersForEnvironment();
    let created = 0;
    let skipped = 0;

    for (const userData of users) {
      const exists = await this.prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (exists) {
        this.log(`User ${userData.email} already exists, skipping`);
        skipped++;
        continue;
      }

      await this.prisma.user.create({
        data: {
          id: userData.id,
          email: userData.email,
          displayName: userData.displayName,
          passwordHash: userData.passwordHash ?? null,
          status: userData.status,
        },
      });

      this.log(`Created user: ${userData.email}`);
      created++;
    }

    this.log(`Seeding complete: ${created} created, ${skipped} skipped`);
  }

  private getUsersForEnvironment(): ReadonlyArray<ISeedUser> {
    if (this.config.isTesting) {
      return this.getTestUsers();
    }

    if (this.config.isStaging) {
      return this.getStagingUsers();
    }

    if (this.config.isProduction) {
      // Production should not seed users
      this.log('Production environment - no users will be seeded');
      return [];
    }

    // Default: Development
    return this.getDevelopmentUsers();
  }

  private getDevelopmentUsers(): ReadonlyArray<ISeedUser> {
    const userCount = this.getEnvNumber('SEED_USER_COUNT', 10);
    const adminEmail = this.getEnvVar('SEED_ADMIN_EMAIL', 'admin@example.com');
    const userPassword = this.getEnvVar('SEED_USER_PASSWORD', 'Dev123!@#');
    const adminPassword = this.getEnvVar('SEED_ADMIN_PASSWORD', 'Admin123!@#');

    const users: ISeedUser[] = [
      {
        id: 'seed-admin-001',
        email: adminEmail,
        displayName: 'Administrator',
        passwordHash: bcrypt.hashSync(adminPassword, BCRYPT_ROUNDS),
        status: 'active',
      },
    ];

    // Add regular users
    for (let i = 1; i < userCount; i++) {
      users.push({
        id: `seed-user-${String(i).padStart(3, '0')}`,
        email: `user${i}@example.com`,
        displayName: `User ${i}`,
        passwordHash: bcrypt.hashSync(userPassword, BCRYPT_ROUNDS),
        status: 'active',
      });
    }

    return users;
  }

  private getTestUsers(): ReadonlyArray<ISeedUser> {
    const testPassword = bcrypt.hashSync('Test123!@#', BCRYPT_ROUNDS);

    return [
      {
        id: 'test-admin-001',
        email: 'admin@test.com',
        displayName: 'Test Admin',
        passwordHash: testPassword,
        status: 'active',
      },
      {
        id: 'test-user-001',
        email: 'user1@test.com',
        displayName: 'Test User 1',
        passwordHash: testPassword,
        status: 'active',
      },
      {
        id: 'test-invited-001',
        email: 'invited@test.com',
        displayName: 'Invited User',
        passwordHash: undefined,
        status: 'invited',
      },
    ];
  }

  private getStagingUsers(): ReadonlyArray<ISeedUser> {
    const stagingPassword = bcrypt.hashSync('Staging123!@#', BCRYPT_ROUNDS);
    const users: ISeedUser[] = [];

    // Create 20 users with realistic names
    const names = [
      'Alice Johnson',
      'Bob Smith',
      'Carol Williams',
      'David Brown',
      'Eve Davis',
      'Frank Miller',
      'Grace Wilson',
      'Henry Moore',
      'Iris Taylor',
      'Jack Anderson',
      'Kate Thomas',
      'Liam Jackson',
      'Mary White',
      'Noah Harris',
      'Olivia Martin',
      'Peter Thompson',
      'Quinn Garcia',
      'Rachel Martinez',
      'Sam Robinson',
      'Tina Clark',
    ];

    names.forEach((name, index) => {
      const firstName = name.split(' ')[0]?.toLowerCase() ?? 'user';
      const lastName = name.split(' ')[1]?.toLowerCase() ?? 'test';
      const email = `${firstName}.${lastName}@staging.example.com`;
      const status = index === 0 ? 'active' : index % 5 === 0 ? 'disabled' : 'active';

      users.push({
        id: `staging-user-${String(index + 1).padStart(3, '0')}`,
        email,
        displayName: name,
        passwordHash: status === 'active' ? stagingPassword : undefined,
        status: status as 'active' | 'disabled',
      });
    });

    return users;
  }
}

export const seedUsers = async (prisma: PrismaClient): Promise<void> => {
  const seeder = new UserSeeder(prisma);
  await seeder.run();
};