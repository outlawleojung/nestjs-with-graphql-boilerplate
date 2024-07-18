import { UUIDBaseModelEntity } from './base-model.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { AccountEntity } from '@lib/entity/entities/account.entity';

@Entity('users')
export class UserEntity extends UUIDBaseModelEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ nullable: true })
  profileImg?: string;

  @OneToMany(() => AccountEntity, (account) => account.user)
  accounts: AccountEntity[];
}
