import { Injectable } from '@nestjs/common';

import type {
  AuthProvider,
  IAuthStrategy,
} from '../../application/strategies/auth-strategy.interface';

import { LocalAuthStrategy } from './auth/local-auth.strategy';

@Injectable()
export class AuthStrategyResolver {
  private readonly strategies = new Map<AuthProvider, IAuthStrategy>();

  public constructor(
    localAuthStrategy: LocalAuthStrategy,
    // Add other strategies as they're implemented
    // oauthStrategy: OAuthStrategy,
    // samlStrategy: SamlStrategy,
  ) {
    this.strategies.set('local', localAuthStrategy);
    // this.strategies.set('oauth', oauthStrategy);
    // this.strategies.set('saml', samlStrategy);
  }

  public resolve(provider: AuthProvider): IAuthStrategy {
    const strategy = this.strategies.get(provider);

    if (!strategy) {
      throw new Error(`Auth strategy not found for provider: ${provider}`);
    }

    return strategy;
  }

  public getDefault(): IAuthStrategy {
    const defaultStrategy = this.strategies.get('local');

    if (!defaultStrategy) {
      throw new Error('Default auth strategy (local) not configured');
    }

    return defaultStrategy;
  }

  public getAvailableProviders(): ReadonlyArray<AuthProvider> {
    return Array.from(this.strategies.keys());
  }
}