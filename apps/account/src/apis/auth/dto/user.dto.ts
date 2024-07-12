// user.dto.ts
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { AccountDto } from './account.dto';

@ObjectType()
export class UserDto {
  @Field(() => String)
  id: string;

  @Field()
  name: string;

  @Field(() => [AccountDto])
  accounts: AccountDto[];
}
