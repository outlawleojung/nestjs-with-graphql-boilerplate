import { TokenService } from './token.service';
import { UserEntity, UserEntityRepository } from '@lib/entity';
import bcryptjs from 'bcryptjs';
import { Logger } from '@nestjs/common';
import { CreateUserInput } from '../../../../apps/account/src/apis/auth/dto/create-user.input';
import { QueryRunner } from 'typeorm';

export class UserValidationService {
  private readonly logger = new Logger(UserValidationService.name);

  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepository: UserEntityRepository,
  ) {}
}
