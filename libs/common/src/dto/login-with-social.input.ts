import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';

@InputType()
export class LoginWithSocialInput {
  @IsString()
  @Field(() => String, { description: 'idToken' })
  idToken: string;

  @IsNumber()
  @Field(() => Int, { description: 'ProviderTypeId' })
  providerTypeId: number;
}
