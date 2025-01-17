// user.dto.ts
import { Field, Int, InputType, ID } from '@nestjs/graphql';

@InputType()
export class GetUserInputDto {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => Int, { nullable: true })
  providerTypeId?: number;
}
