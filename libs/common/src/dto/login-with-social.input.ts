import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class LoginWithSocialInput {
  @Field(() => String, { description: 'idToken' })
  idToken: string;

  @Field(() => Int, { description: 'ProviderTypeId' })
  providerTypeId: number;
}
