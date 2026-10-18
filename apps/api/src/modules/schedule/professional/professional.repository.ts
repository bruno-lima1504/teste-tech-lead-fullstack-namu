import { InjectTransactionHost, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { DefaultTypeOrmRepository } from '@shared/typeorm';
import { SCHEDULE_CONNECTION } from '../shared/persistence/schedule-connection';
import { Professional } from './professional.entity';
import { Specialty } from './professional.types';

@Injectable()
export class ProfessionalRepository extends DefaultTypeOrmRepository<Professional> {
  constructor(
    @InjectTransactionHost(SCHEDULE_CONNECTION)
    txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super(Professional, txHost);
  }

  findActive(specialty?: Specialty): Promise<Professional[]> {
    return this.find({
      where: { active: true, ...(specialty && { specialty }) },
      order: { name: 'ASC', id: 'ASC' },
    });
  }
}
