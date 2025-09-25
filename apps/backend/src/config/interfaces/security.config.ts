export interface ISecurityConfig {
  readonly jwtSecret: string;
  readonly sessionSecret: string;
  readonly apiKey?: string;
}
