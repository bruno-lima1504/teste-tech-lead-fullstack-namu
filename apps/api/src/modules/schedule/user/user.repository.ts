import { InjectTransactionHost, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { DefaultTypeOrmRepository } from '@shared/typeorm';
import { SCHEDULE_CONNECTION } from '../shared/persistence/schedule-connection';
import { User } from './user.entity';

@Injectable()
export class UserRepository extends DefaultTypeOrmRepository<User> {
  constructor(
    @InjectTransactionHost(SCHEDULE_CONNECTION)
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(User, txHost);
  }

  /** SELECT … FOR UPDATE: serializa as operações da mesma pessoa. False se o usuário não existe. */
  async lockById(id: number): Promise<boolean> {
    const user = await this.findOne({
      where: { id },
      select: { id: true },
      lock: { mode: 'pessimistic_write' },
    });
    return user !== null;
  }
}
