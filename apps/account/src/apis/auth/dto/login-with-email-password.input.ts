import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class LoginWithEmailPasswordInput {
  @Field(() => String, { description: 'Email' })
  email: string;

  @Field(() => String, { nullable: true, description: 'Password' })
  password?: string;
}
