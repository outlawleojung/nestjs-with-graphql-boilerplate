import { QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { BaseRepository } from './base.repository';
import {
  applyConditions,
  applyJoinFields,
  applySelectFields,
  UserEntity,
} from '@lib/entity';
import { CreateUserInput } from '../../../../apps/account/src/apis/auth/dto/create-user.input';
import { AccountDto, GetUserParamsDto, UserDto } from '@lib/common';
import { toAccountDTO, toUserDTO } from '@lib/entity/mapper';

export class UserEntityRepository extends BaseRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {
    super(userRepository, UserEntity);
  }

  // async findBySelectField(
  //    params: GetUserParamsDto,
  //   qr?: QueryRunner,
  // ): Promise<Partial<UserDto>> {
  //   const queryBuilder = this.getRepository(qr).createQueryBuilder('user');
  //
  //   const conditionMappings = {
  //     id: 'user.id = :id',
  //     email: 'accounts.email = :email',
  //     name: 'user.name = :name',
  //     providerTypeId: 'accounts.providerTypeId = :providerTypeId',
  //   };
  //   applyConditions(queryBuilder, params, conditionMappings);
  //
  //   // 선택적 필드 적용
  //   const fieldMappings = {
  //     id: 'user.id',
  //     name: 'user.name',
  //     refreshToken: 'user.refreshToken',
  //     createdAt: 'user.createdAt',
  //     accounts: 'accounts.id, accounts.email, accounts.providerTypeId',
  //     'accounts.providerType': 'providerType.id, providerType.name',
  //   };
  //   applySelectFields(
  //     queryBuilder,
  //     'user',
  //     params.selectedFields,
  //     fieldMappings,
  //   );
  //
  //   // 조인 필드 적용
  //   const joinMappings = {
  //     accounts: 'user.accounts',
  //     'accounts.providerType': 'accounts.providerType',
  //   };
  //   if (params.selectedFields.includes('accounts')) {
  //     applyJoinFields(queryBuilder, joinMappings);
  //   }
  //
  //   const userEntity = await queryBuilder.getOne();
  //   if (!userEntity) {
  //     return null;
  //   }
  //
  //   return this.mapToDto(userEntity, params.selectedFields);
  // }

  private readonly fieldMappings = {
    id: 'user.id',
    name: 'user.name',
    refreshToken: 'user.refreshToken',
    createdAt: 'user.createdAt',
    email: 'accounts.email',
    password: 'accounts.password',
    'accounts.id': 'accounts.id',
    'accounts.email': 'accounts.email',
    'accounts.providerTypeId': 'accounts.providerTypeId',
    'accounts.password': 'accounts.password',
    'accounts.createdAt': 'accounts.createdAt',
    'accounts.userId': 'accounts.userId',
    'accounts.providerType.id': 'providerType.id',
    'accounts.providerType.name': 'providerType.name',
  };

  private readonly joinMappings = {
    accounts: 'user.accounts',
    'accounts.providerType': 'accounts.providerType',
  };

  async findUserBySelectField(
    params: any,
    qr?: QueryRunner,
  ): Promise<Partial<UserDto> | null> {
    return this.findBySelectField(
      'user',
      params,
      this.fieldMappings,
      this.joinMappings,
      this.mapToDto,
      qr,
    );
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
        refreshToken: true,
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

  private mapToDto(
    entity: UserEntity,
    selectedFields: string[],
  ): Partial<UserDto> {
    return toUserDTO(entity, selectedFields);
  }
}
