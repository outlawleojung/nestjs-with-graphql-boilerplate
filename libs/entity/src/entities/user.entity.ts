import { UUIDBaseModelEntity } from './base-model.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AccountEntity } from '@lib/entity/entities/account.entity';

@Entity('user')
export class UserEntity extends UUIDBaseModelEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @OneToMany(() => AccountEntity, (account) => account.user)
  accounts: AccountEntity[];
}
