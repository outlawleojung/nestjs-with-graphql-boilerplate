import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AuthService } from './auth.service';

import { UpdateAuthInput } from './dto/update-auth.input';
import { UserDto } from './dto/user.dto';
import { CreateUserInput } from './dto/create-user.input';
import { UseInterceptors } from '@nestjs/common';
import { QueryRunner, TransactionInterceptor } from '@lib/common';
import { QueryRunner as QR } from 'typeorm';
import { CreateUserOutput } from './dto/create-user.output';

// @Resolver(() => Auth)
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => UserDto, { nullable: true })
  async getUser(
    @Args('id', { type: () => String, nullable: true }) id?: string,
    @Args('providerTypeId', { type: () => Int, nullable: true })
    providerTypeId?: number,
  ): Promise<UserDto | null> {
    if (id && providerTypeId) {
      return await this.authService.findByIdAndProviderType(id, providerTypeId);
    } else if (id) {
      return await this.authService.findById(id);
    }
    return null;
  }

  @UseInterceptors(TransactionInterceptor)
  @Mutation(() => CreateUserOutput)
  createUser(
    @QueryRunner() queryRunner: QR,
    @Args('createUserInput') createUserInput: CreateUserInput,
  ) {
    return this.authService.create(createUserInput, queryRunner);
  }

  // @Mutation(() => Auth)
  // createAuth(@Args('createAuthInput') createAuthInput: CreateAuthInput) {
  //   return this.authService.create(createAuthInput);
  // }
  //
  // @Query(() => [Auth], { name: 'auth' })
  // findAll() {
  //   return this.authService.findAll();
  // }
  //
  // @Query(() => Auth, { name: 'auth' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.authService.findOne(id);
  // }
  //
  // @Mutation(() => Auth)
  // updateAuth(@Args('updateAuthInput') updateAuthInput: UpdateAuthInput) {
  //   return this.authService.update(updateAuthInput.id, updateAuthInput);
  // }
  //
  // @Mutation(() => Auth)
  // removeAuth(@Args('id', { type: () => Int }) id: number) {
  //   return this.authService.remove(id);
  // }
}
