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
  LoginWithEmailInput,
  RefreshTokenGuard,
} from '@lib/common';
import { QueryRunner as QR } from 'typeorm';
import { LoginOutput } from './dto/login.output';
import { AccessTokenDto } from './dto/access-token.dto';

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
  @Mutation(() => AccessTokenDto)
  async createTokenAccess(
    @QueryRunner() queryRunner: QR,
    @Context('req') req: any,
  ): Promise<AccessTokenDto> {
    const rawToken = req.headers.authorization;
    console.log('rawToken : ', rawToken);
    return await this.authService.getAccessToken(rawToken, queryRunner);
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
