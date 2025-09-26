import type { IAuthStrategy } from '../../application/strategies/auth-strategy.interface';

import type { LocalAuthStrategy } from './auth/local-auth.strategy';
import { AuthStrategyResolver } from './auth-strategy.resolver';

class StubAuthStrategy implements IAuthStrategy {
  public readonly name = 'local';
  public authenticate = jest.fn();
  public validateToken = jest.fn();
  public generateTokens = jest.fn();
  public revokeToken = jest.fn();
}

describe('AuthStrategyResolver', () => {
  it('resolves registered strategies', () => {
    const localStrategy = new StubAuthStrategy();
    const resolver = new AuthStrategyResolver(localStrategy as unknown as LocalAuthStrategy);

    expect(resolver.resolve('local')).toBe(localStrategy);
    expect(resolver.getDefault()).toBe(localStrategy);
    expect(resolver.getAvailableProviders()).toContain('local');
  });

  it('throws when strategy is missing', () => {
    const localStrategy = new StubAuthStrategy();
    const resolver = new AuthStrategyResolver(localStrategy as unknown as LocalAuthStrategy);

    expect(() => resolver.resolve('oauth')).toThrow('Auth strategy not found for provider: oauth');
  });
});
