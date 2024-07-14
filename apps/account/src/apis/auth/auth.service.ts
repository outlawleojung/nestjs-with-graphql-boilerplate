import { Injectable, Logger } from '@nestjs/common';
import { UpdateAuthInput } from './dto/update-auth.input';
import {
  AccountEntityRepository,
  UserEntity,
  UserEntityRepository,
} from '@lib/entity';
import { UserDto } from './dto/user.dto';
import { ProviderTypeDto } from './dto/provider-type.dto';
import { AccountDto } from './dto/account.dto';
import { CreateUserInput } from './dto/create-user.input';
import { QueryRunner } from 'typeorm';
import bcryptjs from 'bcryptjs';
import { LoginWithEmailPasswordInput } from './dto/login-with-email-password.input';
import { ENV_HASH_ROUNDS_KEY, TokenService } from '@lib/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserEntityRepository,
    private readonly accountRepository: AccountEntityRepository,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {}

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

    await this.accountRepository.createAccount(
      {
        userId: user.id,
        email: createUserInput.email,
        providerTypeId: createUserInput.providerTypeId,
        password: createUserInput.password,
      },
      queryRunner,
    );

    return await this.loginWithEmail(
      createUserInput.email,
      createUserInput.password,
      queryRunner,
    );
  }

  async loginWithEmailPassword(
    input: LoginWithEmailPasswordInput,
    queryRunner: QueryRunner,
  ) {
    const exUser = await this.userRepository.findByEmailAndProviderType(
      input.email,
      1,
    );

    if (!exUser) {
      this.logger.error('패사용자를 찾을 수 없음');
      throw new Error('사용자를 찾을 수 없음');
    }

    const validPassword = bcryptjs.compareSync(
      input.password,
      exUser.accounts[0].password,
    );

    if (!validPassword) {
      this.logger.error('패스워드가 일치 하지 않음');
      throw new Error('패스워드가 일치 하지 않음');
    }

    const newUser = await this.userRepository.findById(exUser.id);
    return newUser;
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

  async authenticatedWithEmailAndPassword(
    email: string,
    password: string,
    qr?: QueryRunner,
  ) {
    const exUser = await this.userRepository.findByEmailAndProviderType(
      email,
      1,
      qr,
    );

    if (!exUser) {
      this.logger.error('패사용자를 찾을 수 없음');
      throw new Error('사용자를 찾을 수 없음');
    }

    const validPassword = bcryptjs.compareSync(
      password,
      exUser.accounts[0].password,
    );

    if (!validPassword) {
      this.logger.error('패스워드가 일치 하지 않음');
      throw new Error('패스워드가 일치 하지 않음');
    }

    const newUser = await this.userRepository.findById(exUser.id);
    return newUser;
  }

  async loginWithEmail(email: string, password: string, qr?: QueryRunner) {
    const existingUser = await this.authenticatedWithEmailAndPassword(
      email,
      password,
      qr,
    );

    return this.loginUser(existingUser);
  }

  registerWithEmail = async (data: CreateUserInput, qr: QueryRunner) => {
    const hash = await bcryptjs.hash(
      data.password,
      this.configService.get<string>(ENV_HASH_ROUNDS_KEY),
    );

    const newUser = await this.userRepository.createUser(
      {
        ...data,
        password: hash,
      },
      qr,
    );

    return this.loginUser(newUser);
  };

  async loginUser(user: UserEntity) {
    return {
      accessToken: this.tokenService.signToken(user, false),
      refreshToken: this.tokenService.signToken(user, true),
    };
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
