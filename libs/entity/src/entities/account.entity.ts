import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ProviderTypeEntity } from './provider-type.entity';
import { BaseModelEntity } from '@lib/entity/entities/base-model.entity';

@Unique(['user', 'providerType'])
@Entity('account')
export class AccountEntity extends BaseModelEntity {
  @Column()
  userId: string;

  @Column()
  providerTypeId: number;

  @Column()
  email: string;

  @Column({ nullable: true })
  password: string | null;

  @ManyToOne(() => UserEntity, (user) => user.accounts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => ProviderTypeEntity, (type) => type.accounts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'providerTypeId' })
  providerType: ProviderTypeEntity;
}
