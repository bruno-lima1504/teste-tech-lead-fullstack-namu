import type { TransactionHost } from '@nestjs-cls/transactional';
import type { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import type {
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';

/**
 * Compõe o Repository do TypeORM em vez de herdar dele: os services só veem os métodos
 * com nome de negócio. O EntityManager vem do TransactionHost, então dentro de um
 * `@Transactional` é o da transação corrente.
 */
export abstract class DefaultTypeOrmRepository<T extends ObjectLiteral & { id: number }> {
  protected constructor(
    private readonly entity: EntityTarget<T>,
    private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {}

  protected get repository(): Repository<T> {
    return this.txHost.tx.getRepository(this.entity);
  }

  save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  findOneById(id: number): Promise<T | null> {
    return this.repository.findOneBy({ id } as FindOptionsWhere<T>);
  }

  existsById(id: number): Promise<boolean> {
    return this.repository.existsBy({ id } as FindOptionsWhere<T>);
  }

  protected findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  protected find(options: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }
}
