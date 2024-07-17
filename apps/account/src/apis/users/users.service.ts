import { Injectable } from '@nestjs/common';
import { UserEntityRepository } from '@lib/entity';
import { GetUserParamsDto, UserDto } from '@lib/common';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserEntityRepository) {}

  async getUser(params: GetUserParamsDto): Promise<Partial<UserDto>> {
    return await this.userRepository.findUserBySelectField(params);
  }
}
