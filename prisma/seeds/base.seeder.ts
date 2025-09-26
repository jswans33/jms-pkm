import type { PrismaClient } from '@prisma/client';

export interface ISeederConfig {
  readonly environment: string;
  readonly isDevelopment: boolean;
  readonly isTesting: boolean;
  readonly isStaging: boolean;
  readonly isProduction: boolean;
}

export abstract class BaseSeeder {
  protected readonly config: ISeederConfig;

  protected constructor(protected readonly prisma: PrismaClient) {
    const env = process.env['NODE_ENV'] ?? 'development';
    this.config = {
      environment: env,
      isDevelopment: env === 'development',
      isTesting: env === 'testing',
      isStaging: env === 'staging',
      isProduction: env === 'production',
    };
  }

  /**
   * Run the seeder - must be idempotent
   */
  public abstract run(): Promise<void>;

  /**
   * Get the name of this seeder for logging
   */
  public abstract getName(): string;

  /**
   * Log a message with the seeder name prefix
   */
  protected log(message: string): void {
    console.log(`[${this.getName()}] ${message}`);
  }

  /**
   * Log an error with the seeder name prefix
   */
  protected error(message: string, error?: unknown): void {
    console.error(`[${this.getName()}] ${message}`, error);
  }

  /**
   * Check if a record exists (helper for idempotency)
   */
  protected async exists<T>(
    model: { findUnique: (args: { where: Record<string, unknown> }) => Promise<T | null> },
    where: Record<string, unknown>,
  ): Promise<boolean> {
    const result = await model.findUnique({ where });
    return result !== null;
  }

  /**
   * Get environment variable with fallback
   */
  protected getEnvVar(key: string, fallback: string): string {
    return process.env[key] ?? fallback;
  }

  /**
   * Get numeric environment variable with fallback
   */
  protected getEnvNumber(key: string, fallback: number): number {
    const value = process.env[key];
    if (!value) return fallback;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? fallback : parsed;
  }
}