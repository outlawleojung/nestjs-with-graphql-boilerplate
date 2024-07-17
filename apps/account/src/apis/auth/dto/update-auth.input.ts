import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { RegisterWithEmailInput } from '@lib/common';

@InputType()
export class UpdateAuthInput extends PartialType(RegisterWithEmailInput) {
  @Field(() => Int)
  id: number;
}
