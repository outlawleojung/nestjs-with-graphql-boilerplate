import { Injectable } from '@nestjs/common';
import { UserEntityRepository } from '@lib/entity';
import { GetUserParamsDto, UserDto } from '@lib/common';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserEntityRepository) {}

  async getUser(params: GetUserParamsDto): Promise<UserDto> {
    return await this.userRepository.findBySelectField(params);
  }
}
