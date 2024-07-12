import { QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { BaseRepository } from './base.repository';
import { AccountEntity, UserEntity } from '@lib/entity';

export class AccountEntityRepository extends BaseRepository<AccountEntity> {
  constructor(
    @InjectRepository(AccountEntity)
    private accountRepository: Repository<AccountEntity>,
  ) {
    super(accountRepository, UserEntity);
  }

  async createAccount(
    data: {
      userId: string;
      providerTypeId: number;
      password?: string;
    },
    qr: QueryRunner,
  ) {
    const account = new AccountEntity();
    account.userId = data.userId;
    account.password = data.password;
    account.providerTypeId = data.providerTypeId;

    await this.getRepository(qr).save(account);
  }
}
