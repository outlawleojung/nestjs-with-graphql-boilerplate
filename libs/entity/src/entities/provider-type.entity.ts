import { BaseTypeModelEntity } from './base-type-model.entity';
import { Entity, OneToMany } from 'typeorm';
import { AccountEntity } from '@lib/entity/entities/account.entity';

@Entity('provider_type')
export class ProviderTypeEntity extends BaseTypeModelEntity {
  @OneToMany(() => AccountEntity, (account) => account.providerType)
  accounts: AccountEntity[];
}
