import { QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { BaseRepository } from './base.repository';
import { AccountEntity, UserEntity } from '@lib/entity';
import { AccountEntityRepository } from './account.repository';
import { CreateUserInput } from '../../../../apps/account/src/apis/auth/dto/create-user.input';

export class UserEntityRepository extends BaseRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private accountRepository: AccountEntityRepository,
  ) {
    super(userRepository, UserEntity);
  }

  async findById(id: string) {
    return await this.repository.findOne({
      where: {
        id,
      },
      relations: ['accounts', 'accounts.providerType'],
      select: {
        id: true,
        name: true,
        accounts: {
          id: true,
          email: true,
          providerType: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findByIdAndProviderType(id: string, providerTypeId: number) {
    return await this.repository.findOne({
      where: {
        id,
        accounts: {
          providerTypeId,
        },
      },
      relations: ['accounts', 'accounts.providerType'],
      select: {
        id: true,
        name: true,
        accounts: {
          id: true,
          email: true,
          providerType: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async createUser(data: CreateUserInput, qr: QueryRunner) {
    const user = new UserEntity();
    user.name = data.name;

    await this.getRepository(qr).save(user);

    const account = new AccountEntity();
    account.userId = user.id;
    account.password = data.password;
    account.providerTypeId = data.providerTypeId;
    account.email = data.email;

    await this.accountRepository.createAccount(
      {
        userId: user.id,
        providerTypeId: data.providerTypeId,
        password: data.password,
      },
      qr,
    );
  }

  async updateUser(id: string, updates: Partial<UserEntity>, qr?: QueryRunner) {
    const user = await this.getRepository(qr).findOneBy({
      id,
    });

    if (!user) {
      throw new Error('user not found');
    }

    Object.assign(user, updates);

    return await this.getRepository(qr).save(user);
  }

  async deleteUser(id: string, qr: QueryRunner) {
    const user = await this.getRepository(qr).findOneBy({
      id,
    });

    if (!user) {
      throw new Error('user not found');
    }

    return await this.getRepository(qr).delete({ id });
  }
}
