import { Field, Int, InputType } from '@nestjs/graphql';

@InputType()
export class CheckUserRegisterInput {
  @Field(() => String)
  socialToken: string;

  @Field(() => Int)
  providerTypeId: number;
}
