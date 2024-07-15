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

@Unique(['email'])
@Unique(['user', 'providerType'])
@Entity('account')
export class AccountEntity extends BaseModelEntity {
  @Column({ nullable: false })
  userId: string;

  @Column({ nullable: false })
  providerTypeId: number;

  @Column()
  email: string;

  @Column({ nullable: true })
  password: string | null;

  @ManyToOne(() => UserEntity, (user) => user.accounts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => ProviderTypeEntity, (type) => type.accounts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'provider_type_id' })
  providerType: ProviderTypeEntity;
}
