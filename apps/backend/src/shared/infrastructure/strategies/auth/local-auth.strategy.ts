import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { ApplicationConfigService } from '../../../../config/config.service';
import type { IUserRepository } from '../../../../users/application/ports/user.repository.interface';
import { User } from '../../../../users/domain/entities/user.entity';
import { UserId } from '../../../../users/domain/value-objects/user-id.value-object';
import type {
  IAuthCredentials,
  IAuthStrategy,
  IAuthToken,
  IAuthUser,
} from '../../../application/strategies/auth-strategy.interface';

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY_SECONDS = 3600; // 1 hour

@Injectable()
export class LocalAuthStrategy implements IAuthStrategy {
  public readonly name = 'local';

  public constructor(
    private readonly config: ApplicationConfigService,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  public async authenticate(credentials: IAuthCredentials): Promise<IAuthUser> {
    // Check for admin bootstrap first (only if admin doesn't exist yet)
    if (credentials.email === 'admin@example.com') {
      const existingAdmin = await this.userRepository.findByEmail('admin@example.com');
      if (!existingAdmin && credentials.password === 'admin123') {
        const adminUser = await this.ensureAdminUser();
        return {
          id: adminUser.id.toString(),
          email: adminUser.email,
          displayName: adminUser.displayName,
          roles: ['admin', 'user'],
        };
      }
    }

    // Look up user
    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user || !user.passwordHash) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await this.comparePassword(credentials.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    return {
      id: user.id.toString(),
      email: user.email,
      displayName: user.displayName,
      roles: user.email === 'admin@example.com' ? ['admin', 'user'] : ['user'],
    };
  }

  private async ensureAdminUser(): Promise<User> {
    const adminEmail = 'admin@example.com';
    let user = await this.userRepository.findByEmail(adminEmail);

    if (!user) {
      const passwordHash = await this.hashPassword('admin123');
      user = User.create({
        id: UserId.generate(),
        email: adminEmail,
        displayName: 'Admin User',
        passwordHash,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      user = await this.userRepository.save(user);
    }

    return user;
  }

  public async validateToken(token: string): Promise<IAuthUser | null> {
    if (await this.isTokenRevoked(token)) {
      return null;
    }

    try {
      const decoded = jwt.verify(token, this.config.security.jwtSecret) as IAuthUser;
      return decoded;
    } catch {
      return null;
    }
  }

  public async generateTokens(user: IAuthUser): Promise<IAuthToken> {
    const payload = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles: user.roles,
    };

    const accessToken = jwt.sign(payload, this.config.security.jwtSecret, {
      expiresIn: TOKEN_EXPIRY_SECONDS,
    });

    return {
      accessToken,
      expiresIn: TOKEN_EXPIRY_SECONDS,
    };
  }

  /**
   * WARNING: Token revocation is currently stored in-memory only.
   * This means:
   * - Revoked tokens become valid again after server restart
   * - In multi-instance deployments, revocation won't be shared across instances
   *
   * For production use, implement one of:
   * - Redis-backed token blacklist
   * - Database table for revoked tokens
   * - Switch to stateful sessions instead of stateless JWTs
   */
  private readonly revokedTokens = new Set<string>();

  public async revokeToken(token: string): Promise<void> {
    this.revokedTokens.add(token);
    await Promise.resolve();
  }

  public async isTokenRevoked(token: string): Promise<boolean> {
    return this.revokedTokens.has(token);
  }

  public async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  public async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}