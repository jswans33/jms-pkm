export interface IAuthCredentials {
  readonly email: string;
  readonly password: string;
}

export interface IAuthToken {
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly expiresIn: number;
}

export interface IAuthUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly roles: ReadonlyArray<string>;
}

export interface IAuthStrategy {
  readonly name: string;

  authenticate(credentials: IAuthCredentials): Promise<IAuthUser>;
  validateToken(token: string): Promise<IAuthUser | null>;
  generateTokens(user: IAuthUser): Promise<IAuthToken>;
  revokeToken(token: string): Promise<void>;
}

export type AuthProvider = 'local' | 'oauth' | 'saml' | 'jwt';