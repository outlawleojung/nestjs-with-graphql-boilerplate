import { QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { BaseRepository } from './base.repository';
import { UserEntity } from '@lib/entity';
import { CreateUserInput } from '../../../../apps/account/src/apis/auth/dto/create-user.input';

export class UserEntityRepository extends BaseRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {
    super(userRepository, UserEntity);
  }

  async findById(id: string, queryRunner?: QueryRunner) {
    return await this.getRepository(queryRunner).findOne({
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

  async findByEmail(email: string) {
    return await this.repository.findOne({
      where: {
        accounts: {
          email,
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

  async findByEmailAndProviderType(
    email: string,
    providerTypeId: number,
    qr?: QueryRunner,
  ) {
    return await this.getRepository(qr).findOne({
      where: {
        accounts: {
          email,
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
          password: true,
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

    return user;
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
