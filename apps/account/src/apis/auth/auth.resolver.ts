import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { Logger, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  CommonService,
  QueryRunner,
  TransactionInterceptor,
  RefreshTokenGuard,
  RegisterWithEmailInput,
} from '@lib/common';
import { QueryRunner as QR } from 'typeorm';
import { TokenOutput } from './dto/token.output';
import { TokenResponseDto } from './dto/access-token.dto';
import { isBoolean } from 'class-validator';
import { CheckUserRegisterInput } from './dto/check-user-register.input';
import { LoginWithSocialInput } from '@lib/common/dto/login-with-social.input';
import { RegisterWithSocialInput } from '@lib/common/dto/register-with-social.input';
import { MorganInterceptor } from 'nest-morgan';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly commonService: CommonService,
  ) {}
  private readonly logger = new Logger(AuthResolver.name);
  @Query(() => String)
  healthCheck(): string {
    this.logger.log('-----------------healthCheck---------------');
    return 'OK';
  }

  @UseInterceptors(TransactionInterceptor)
  @UseGuards(RefreshTokenGuard)
  @Mutation(() => TokenResponseDto)
  async createTokenAccess(
    @QueryRunner() queryRunner: QR,
    @Context('req') req: Request,
  ): Promise<TokenResponseDto> {
    const rawToken = req.headers.authorization;
    console.log('rawToken : ', rawToken);
    return await this.authService.generateToken(
      rawToken,
      true,
      false,
      queryRunner,
    );
  }

  @UseInterceptors(TransactionInterceptor)
  @UseGuards(RefreshTokenGuard)
  @Mutation(() => TokenResponseDto)
  async createTokenRefresh(
    @QueryRunner() queryRunner: QR,
    @Context('req') req: Request,
  ): Promise<TokenResponseDto> {
    const rawToken = req.headers.authorization;
    console.log('rawToken : ', rawToken);
    return await this.authService.generateToken(
      rawToken,
      true,
      true,
      queryRunner,
    );
  }

  @UseInterceptors(TransactionInterceptor)
  @Mutation(() => TokenOutput)
  async registerWithEmail(
    @QueryRunner() queryRunner: QR,
    @Args('input') input: RegisterWithEmailInput,
  ): Promise<TokenOutput> {
    return await this.authService.registerWithEmail(input, queryRunner);
  }

  @UseInterceptors(TransactionInterceptor)
  @Mutation(() => TokenOutput)
  async loginWithEmail(
    @QueryRunner() queryRunner: QR,
    @Context('req') req: Request,
  ): Promise<TokenOutput> {
    const rawToken = req.headers.authorization;
    return await this.authService.loginWithEmail(rawToken, queryRunner);
  }

  @Query(() => Boolean)
  async checkUserRegister(@Args('input') input: CheckUserRegisterInput) {
    return await this.authService.checkUserRegister(input);
  }

  @UseInterceptors(TransactionInterceptor)
  @Mutation(() => TokenOutput)
  async registerWithSocial(
    @QueryRunner() queryRunner: QR,
    @Args('input') input: RegisterWithSocialInput,
  ): Promise<TokenOutput> {
    return await this.authService.registerWithSocial(input, queryRunner);
  }

  @UseInterceptors(TransactionInterceptor)
  @Mutation(() => TokenOutput)
  async loginWithSocial(
    @QueryRunner() queryRunner: QR,
    @Args('input') input: LoginWithSocialInput,
  ): Promise<TokenOutput> {
    return await this.authService.loginWithSocial(input, queryRunner);
  }
}
