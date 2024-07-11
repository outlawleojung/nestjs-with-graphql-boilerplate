import { BaseTypeModelEntity } from './base-type-model.entity';
import { OneToMany } from 'typeorm';
import { AccountEntity } from '@lib/entity/entities/account.entity';

export class ProviderTypeEntity extends BaseTypeModelEntity {
  @OneToMany(() => AccountEntity, (account) => account.providerType)
  accounts: AccountEntity[];
}
