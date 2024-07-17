import { Injectable, Logger } from '@nestjs/common';
import { AccountEntityRepository, UserEntityRepository } from '@lib/entity';
import { CreateUserInput } from './dto/create-user.input';
import { QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  ENV_HASH_ROUNDS_KEY,
  TokenService,
  UserValidationService,
  LoginWithEmailInput,
  TokenUtilsService,
  LoginAuthDto,
} from '@lib/common';
import { ConfigService } from '@nestjs/config';
import { LoginOutput } from './dto/login.output';
import { AccessTokenDto } from './dto/access-token.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserEntityRepository,
    private readonly accountRepository: AccountEntityRepository,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly tokenUtilsService: TokenUtilsService,
    private readonly userValidationService: UserValidationService,
  ) {}

  async loginWithEmail(rawToken: string, queryRunner: QueryRunner) {
    const token = this.tokenUtilsService.extractTokenFromHeader(
      rawToken,
      false,
    );

    const credentials = this.tokenUtilsService.decodeBasicToken(token);

    const exUser =
      await this.userValidationService.authenticateWithEmailAndPassword(
        credentials,
        queryRunner,
      );

    const result: LoginOutput = await this.loginUser(exUser);

    await this.tokenService.saveRefreshToken(result.refreshToken);

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

  async getAccessToken(
    rawToken: string,
    queryRunner: QueryRunner,
  ): Promise<AccessTokenDto> {
    const token = this.tokenUtilsService.extractTokenFromHeader(rawToken, true);
    const newToken = await this.tokenService.rotateToken(
      token,
      false,
      queryRunner,
    );

    /**
     * {accessToken: {token}}
     */
    return {
      accessToken: newToken,
    };
  }
}
