import { QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { BaseRepository } from './base.repository';
import { AccountEntity, UserEntity } from '@lib/entity';

export class AccountEntityRepository extends BaseRepository<AccountEntity> {
  constructor(
    @InjectRepository(AccountEntity)
    private accountRepository: Repository<AccountEntity>,
  ) {
    super(accountRepository, AccountEntity);
  }

  async createAccount(
    data: {
      userId: string;
      email: string;
      providerTypeId: number;
      password?: string;
    },
    queryRunner: QueryRunner,
  ) {
    const account = new AccountEntity();
    account.userId = data.userId;
    account.password = data.password;
    account.email = data.email;
    account.providerTypeId = data.providerTypeId;

    return await this.getRepository(queryRunner).save(account);
  }
}
