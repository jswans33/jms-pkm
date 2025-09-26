export interface IAuditEvent {
  readonly id?: string;
  readonly timestamp: Date;
  readonly userId?: string;
  readonly action: string;
  readonly resource: string;
  readonly resourceId?: string;
  readonly metadata?: Record<string, unknown>;
  readonly result: 'success' | 'failure';
  readonly errorMessage?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

export interface IAuditQuery {
  readonly userId?: string;
  readonly action?: string;
  readonly resource?: string;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly limit?: number;
  readonly offset?: number;
}

export interface IAuditTrailStrategy {
  readonly name: string;

  log(event: IAuditEvent): Promise<void>;
  query(params: IAuditQuery): Promise<ReadonlyArray<IAuditEvent>>;
  purge(beforeDate: Date): Promise<number>;
}

export type AuditProvider = 'console' | 'database' | 'elasticsearch' | 'file';