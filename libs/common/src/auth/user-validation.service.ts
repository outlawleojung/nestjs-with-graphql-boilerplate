import { UserEntityRepository } from '@lib/entity';
import { Injectable, Logger } from '@nestjs/common';
import { LoginWithEmailInput } from '@lib/common';
import { PROVIDER_TYPE } from '@lib/common/constants/constants';
import * as bcrypt from 'bcrypt';
import { QueryRunner } from 'typeorm';
import { LoginWithSocialInput } from '@lib/common/dto/login-with-social.input';

@Injectable()
export class UserValidationService {
  private readonly logger = new Logger(UserValidationService.name);

  constructor(private readonly userRepository: UserEntityRepository) {}

  async authenticateWithEmailAndPassword(
    user: LoginWithEmailInput,
    queryRunner?: QueryRunner,
  ) {
    const exUser = await this.userRepository.findUserBySelectField(
      {
        selectedFields: ['id', 'name', 'accounts.password'],
        email: user.email,
        providerTypeId: PROVIDER_TYPE.LOCAL,
      },
      queryRunner,
    );

    if (!exUser) {
      this.logger.error('사용자를 찾을 수 없음');
      throw new Error('사용자를 찾을 수 없음');
    }

    const validPassword = bcrypt.compareSync(
      user.password,
      exUser.accounts[0].password,
    );

    if (!validPassword) {
      this.logger.error('패스워드가 일치 하지 않음');
      throw new Error('패스워드가 일치 하지 않음');
    }

    return {
      id: exUser.id,
      name: exUser.name,
      email: user.email,
      providerTypeId: PROVIDER_TYPE.LOCAL,
    };
  }

  async authenticateWithSocialToken(
    socialToken: string,
    providerTypeId: number,
    queryRunner?: QueryRunner,
  ) {
    const exUser = await this.userRepository.findUserBySelectField(
      {
        selectedFields: [
          'id',
          'name',
          'accounts.providerTypeId',
          'accounts.email',
          'accounts.socialToken',
        ],
        socialToken: socialToken,
        providerTypeId: providerTypeId,
      },
      queryRunner,
    );

    if (!exUser) {
      this.logger.error('사용자를 찾을 수 없음');
      throw new Error('사용자를 찾을 수 없음');
    }

    return {
      id: exUser.id,
      name: exUser.name,
      email: exUser.accounts[0].email,
      providerTypeId: exUser.accounts[0].providerTypeId,
    };
  }
}
