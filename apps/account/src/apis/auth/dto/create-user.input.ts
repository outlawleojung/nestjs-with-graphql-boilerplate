import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field(() => String, { description: 'Email' })
  email: string;

  @Field(() => String, { nullable: true, description: 'Password' })
  password?: string;

  @Field(() => String, { description: 'Name' })
  name: string;

  @Field(() => Int, { description: 'ProviderTypeId' })
  providerTypeId: number;
}
