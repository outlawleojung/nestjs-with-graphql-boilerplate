import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { ProviderTypeEntity } from './provider-type.entity';

@Entity('account')
export class AccountEntity {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  providerTypeId: number;

  @Column()
  email: string;

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
