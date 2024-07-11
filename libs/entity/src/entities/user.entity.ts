import { UUIDBaseModelEntity } from './base-model.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AccountEntity } from '@lib/entity/entities/account.entity';
import { ProviderTypeEntity } from '@lib/entity/entities/provider-type.entity';

@Entity('user')
export class UserEntity extends UUIDBaseModelEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToMany(() => AccountEntity, (account) => account.user)
  accounts: AccountEntity[];
}
