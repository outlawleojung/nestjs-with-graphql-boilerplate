import { Injectable } from '@nestjs/common';
import { UserEntityRepository } from '@lib/entity';
import { GetUserParamsDto, UserDto } from '@lib/common';
import { UpdateUserInput } from '@lib/common/dto/update-user.input';
import { QueryRunner } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserEntityRepository) {}

  async getUser(params: GetUserParamsDto): Promise<Partial<UserDto>> {
    return await this.userRepository.findUserBySelectField(params);
  }

  async updateUser(
    userId: string,
    input: UpdateUserInput,
    queryRunner: QueryRunner,
  ): Promise<Partial<UserDto>> {
    return await this.userRepository.updateUser(userId, input, queryRunner);
  }
}
