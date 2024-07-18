import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class RegisterWithSocialInput {
  @Field(() => String, { description: 'idToken' })
  idToken: string;

  @Field(() => Int, { description: 'ProviderTypeId' })
  providerTypeId: number;

  @Field(() => String, { description: 'Name' })
  name: string;
}
