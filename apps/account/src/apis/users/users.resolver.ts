import { Args, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { QueryRunner as QR } from 'typeorm';
import { UsersService } from './users.service';
import { GetUserInputDto } from '../auth/dto/get-user-input.dto';
import { GraphQLResolveInfo } from 'graphql/type';
import {
  AccessTokenGuard,
  CommonService,
  UserDto,
  User,
  QueryRunner,
  TransactionInterceptor,
} from '@lib/common';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { UpdateUserInput } from '@lib/common/dto/update-user.input';

@Resolver(() => UserDto)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly commonService: CommonService,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Query(() => UserDto, { nullable: true })
  async getUser(
    @Args('input') input: GetUserInputDto,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Partial<UserDto | null>> {
    const selectedFields = this.commonService.getSelectedFields(info);

    return await this.usersService.getUser({ ...input, selectedFields });
  }

  @UseInterceptors(TransactionInterceptor)
  @UseGuards(AccessTokenGuard)
  @Mutation(() => UserDto, { nullable: true })
  async updateUser(
    @User('id') userId: string,
    @QueryRunner() queryRunner: QR,
    @Args('input')
    input: UpdateUserInput,
  ): Promise<Partial<UserDto | null>> {
    return await this.usersService.updateUser(userId, input, queryRunner);
  }
}
