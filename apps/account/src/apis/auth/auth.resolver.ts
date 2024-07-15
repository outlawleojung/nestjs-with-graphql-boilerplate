import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AuthService } from './auth.service';

import { CreateUserInput } from './dto/create-user.input';
import { UseInterceptors } from '@nestjs/common';
import { QueryRunner, TransactionInterceptor } from '@lib/common';
import { QueryRunner as QR } from 'typeorm';
import { LoginOutput } from './dto/login.output';
import { LoginWithEmailInput } from './dto/login-with-email.input';

import { UserDto } from './dto/get-user.dto';
import { GetUserIntputDto } from './dto/get-user-input.dto';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => GetUserIntputDto, { nullable: true })
  async getUser(
    @Args('id', { type: () => String, nullable: true }) id?: string,
    @Args('providerTypeId', { type: () => Int, nullable: true })
    providerTypeId?: number,
  ): Promise<UserDto | null> {
    // if (id && providerTypeId) {
    //   return await this.authService.findByIdAndProviderType(id, providerTypeId);
    // } else if (id) {
    //   return await this.authService.findById(id);
    // }
    // return null;
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
  login(
    @QueryRunner() queryRunner: QR,
    @Args('loginWithEmailInput')
    input: LoginWithEmailInput,
  ) {
    return this.authService.loginWithEmail(input, queryRunner);
  }
}
