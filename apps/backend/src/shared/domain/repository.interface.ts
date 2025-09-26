export interface IRepository<Entity, Id> {
  findById(id: Readonly<Id>): Promise<Entity | null>;
  save(entity: Readonly<Entity>): Promise<Entity>;
  deleteById(id: Readonly<Id>): Promise<void>;
}

export interface IQueryRepository<Entity, Criteria, Result = Entity> {
  findOne(criteria: Readonly<Criteria>): Promise<Result | null>;
  findMany(criteria: Readonly<Criteria>): Promise<ReadonlyArray<Result>>;
}
