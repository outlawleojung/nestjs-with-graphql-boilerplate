import { Injectable, Logger } from '@nestjs/common';
import { AccountEntityRepository, UserEntityRepository } from '@lib/entity';
import { QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  ENV_HASH_ROUNDS_KEY,
  TokenService,
  UserValidationService,
  TokenUtilsService,
  LoginAuthDto,
  RegisterWithEmailInput,
} from '@lib/common';
import { ConfigService } from '@nestjs/config';
import { LoginOutput } from './dto/login.output';
import { TokenResponseDto } from './dto/access-token.dto';
import { CheckUserRegisterInput } from './dto/check-user-register.input';
import { PROVIDER_TYPE } from '@lib/common/constants/constants';

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
    data: RegisterWithEmailInput,
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

    const result: LoginOutput = await this.loginUser(newUser);

    await this.tokenService.saveRefreshToken(result.refreshToken, queryRunner);

    return result;
  };

  async loginUser(user: LoginAuthDto): Promise<LoginOutput> {
    return {
      accessToken: this.tokenService.signToken(user, false),
      refreshToken: this.tokenService.signToken(user, true),
    };
  }

  async checkUserRegister(dto: CheckUserRegisterInput) {
    const exUser = await this.userRepository.findUserBySelectField({
      selectedFields: ['id', 'accounts.socialToken'],
      socialToken: dto.socialToken,
      providerTypeId: dto.providerTypeId,
    });
    return !!exUser;
  }
  async generateToken(
    rawToken: string,
    isBearer: boolean,
    isRefresh: boolean,
    queryRunner: QueryRunner,
  ): Promise<TokenResponseDto> {
    const token = this.tokenUtilsService.extractTokenFromHeader(
      rawToken,
      isBearer,
    );
    const newToken = await this.tokenService.rotateToken(
      token,
      isRefresh,
      queryRunner,
    );

    if (isRefresh) {
      await this.tokenService.saveRefreshToken(newToken);
      return {
        refreshToken: newToken,
      };
    } else {
      return {
        accessToken: newToken,
      };
    }
  }
}
