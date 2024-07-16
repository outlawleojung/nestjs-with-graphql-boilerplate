import { Field, ID, InputType, Int } from '@nestjs/graphql';

@InputType()
export class GetUserParamsDto {
  @Field(() => [String])
  selectedFields: string[];

  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => Int, { nullable: true })
  providerTypeId?: number;
}
