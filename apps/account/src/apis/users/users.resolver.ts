import { Args, Info, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { GetUserInputDto } from '../auth/dto/get-user-input.dto';
import { GraphQLResolveInfo } from 'graphql/type';
import { AccessTokenGuard, CommonService, UserDto } from '@lib/common';
import { UseGuards } from '@nestjs/common';

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
}
