import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Info,
  Context,
} from '@nestjs/graphql';
import { AuthService } from './auth.service';

import { CreateUserInput } from './dto/create-user.input';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import {
  CommonService,
  QueryRunner,
  TransactionInterceptor,
  RefreshTokenGuard,
} from '@lib/common';
import { QueryRunner as QR } from 'typeorm';
import { LoginOutput } from './dto/login.output';
import { TokenResponseDto } from './dto/access-token.dto';

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
    @Context('req') req: any,
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
    @Context('req') req: any,
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
  createUser(
    @QueryRunner() queryRunner: QR,
    @Args('createUserInput') input: CreateUserInput,
  ) {
    return this.authService.registerWithEmail(input, queryRunner);
  }

  @UseInterceptors(TransactionInterceptor)
  @Mutation(() => LoginOutput)
  loginWithEmail(@QueryRunner() queryRunner: QR, @Context('req') req: any) {
    const rawToken = req.headers.authorization;
    return this.authService.loginWithEmail(rawToken, queryRunner);
  }
}
