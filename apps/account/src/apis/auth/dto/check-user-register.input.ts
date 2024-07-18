import { Field, Int, InputType } from '@nestjs/graphql';

@InputType()
export class CheckUserRegisterInput {
  @Field(() => String)
  idToken: string;

  @Field(() => Int)
  providerTypeId: number;
}
