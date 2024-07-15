import { Injectable, Logger } from '@nestjs/common';
import { UpdateAuthInput } from './dto/update-auth.input';
import {
  AccountEntityRepository,
  UserEntity,
  UserEntityRepository,
} from '@lib/entity';
import { ProviderTypeDto } from './dto/provider-type.dto';
import { AccountDto } from './dto/account.dto';
import { CreateUserInput } from './dto/create-user.input';
import { QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginWithEmailInput } from './dto/login-with-email.input';
import { ENV_HASH_ROUNDS_KEY, TokenService } from '@lib/common';
import { ConfigService } from '@nestjs/config';
import { LoginAuthDto } from './dto/login-auth.dto';
import { PROVIDER_TYPE } from '@lib/common/constants/constants';
import { LoginOutput } from './dto/login.output';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserEntityRepository,
    private readonly accountRepository: AccountEntityRepository,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {}

  async findById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) return null;

    return user;
  }

  async findByIdAndProviderType(id: string, providerTypeId: number) {
    const user = await this.userRepository.findByIdAndProviderType(
      id,
      providerTypeId,
    );
    if (!user) return null;
    return user;
  }

  async loginWithEmail(input: LoginWithEmailInput, queryRunner: QueryRunner) {
    const exUser = await this.authenticateWithEmailAndPassword(input);

    const result: LoginOutput = await this.loginUser(exUser);
    await this.userRepository.updateUser(
      exUser.id,
      { refreshToken: result.refreshToken },
      queryRunner,
    );

    return result;
  }

  async validateUser(accessToken: string) {
    try {
      const result = await this.tokenService.verifyToken(accessToken);
      return await this.userRepository.findByEmail(result.email);
    } catch (error) {
      console.log('토큰 오류 :', error.toString());

      throw error;
    }
  }

  async authenticateWithEmailAndPassword(user: LoginWithEmailInput) {
    const exUser = await this.userRepository.findByEmailAndProviderType(
      user.email,
      PROVIDER_TYPE.LOCAL,
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

    return { id: exUser.id, name: exUser.name, email: user.email };
  }

  registerWithEmail = async (
    data: CreateUserInput,
    queryRunner: QueryRunner,
  ) => {
    const hash = await bcrypt.hash(
      data.password,
      parseInt(this.configService.get<string>(ENV_HASH_ROUNDS_KEY)),
    );

    const user = await this.userRepository.createUser(
      {
        ...data,
      },
      queryRunner,
    );

    console.log(user);

    await this.accountRepository.createAccount(
      {
        userId: user.id,
        email: data.email,
        providerTypeId: data.providerTypeId,
        password: hash,
      },
      queryRunner,
    );

    const newUser: LoginAuthDto = {
      id: user.id,
      email: data.email,
      name: data.name,
    };

    return this.loginUser(newUser);
  };

  async loginUser(user: LoginAuthDto): Promise<LoginOutput> {
    return {
      accessToken: this.tokenService.signToken(user, false),
      refreshToken: this.tokenService.signToken(user, true),
    };
  }
}
