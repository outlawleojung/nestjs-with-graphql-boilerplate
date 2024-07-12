import { Injectable } from '@nestjs/common';
import { UpdateAuthInput } from './dto/update-auth.input';
import { UserEntity, UserEntityRepository } from '@lib/entity';
import { UserDto } from './dto/user.dto';
import { ProviderTypeDto } from './dto/provider-type.dto';
import { AccountDto } from './dto/account.dto';
import { CreateUserInput } from './dto/create-user.input';
import { QueryRunner } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserEntityRepository) {}

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthInput: UpdateAuthInput) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async findById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) return null;

    return this.toUserDto(user);
  }

  async findByIdAndProviderType(id: string, providerTypeId: number) {
    const user = await this.userRepository.findByIdAndProviderType(
      id,
      providerTypeId,
    );
    if (!user) return null;
    return this.toUserDto(user);
  }

  async create(createUserInput: CreateUserInput, queryRunner: QueryRunner) {
    const user = await this.userRepository.createUser(
      createUserInput,
      queryRunner,
    );
  }
  private toUserDto(user: UserEntity): UserDto {
    return {
      id: user.id,
      name: user.name,
      accounts: user.accounts.map(
        (account) =>
          ({
            id: account.id,
            email: account.email,
            providerType: {
              id: account.providerType.id,
              name: account.providerType.name,
            } as ProviderTypeDto,
          }) as AccountDto,
      ),
    };
  }
}
