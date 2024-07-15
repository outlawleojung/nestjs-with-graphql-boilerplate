// user.dto.ts
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { AccountDto } from './account.dto';

@ObjectType()
export class GetUserIntputDto {
  @Field(() => String)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  providerTypeId: number;
}
