import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import {
  CommonService,
  QueryRunner,
  TransactionInterceptor,
  RefreshTokenGuard,
  RegisterWithEmailInput,
} from '@lib/common';
import { QueryRunner as QR } from 'typeorm';
import { LoginOutput } from './dto/login.output';
import { TokenResponseDto } from './dto/access-token.dto';
import { isBoolean } from 'class-validator';
import { CheckUserRegisterInput } from './dto/check-user-register.input';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly commonService: CommonService,
  ) {}

  @Query(() => String)
  healthCheck(): string {
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
  @Mutation(() => LoginOutput)
  registerWithEmail(
    @QueryRunner() queryRunner: QR,
    @Args('input') input: RegisterWithEmailInput,
  ) {
    return this.authService.registerWithEmail(input, queryRunner);
  }

  @UseInterceptors(TransactionInterceptor)
  @Mutation(() => LoginOutput)
  loginWithEmail(@QueryRunner() queryRunner: QR, @Context('req') req: Request) {
    const rawToken = req.headers.authorization;
    return this.authService.loginWithEmail(rawToken, queryRunner);
  }

  @Query(() => Boolean)
  checkUserRegister(@Args('dto') dto: CheckUserRegisterInput) {
    return this.authService.checkUserRegister(dto);
  }
}
