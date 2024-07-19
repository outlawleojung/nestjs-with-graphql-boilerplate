import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';

@InputType()
export class RegisterWithSocialInput {
  @IsString()
  @Field(() => String, { description: 'idToken' })
  idToken: string;

  @IsNumber()
  @Field(() => Int, { description: 'ProviderTypeId' })
  providerTypeId: number;

  @IsString()
  @Field(() => String, { description: 'Name' })
  name: string;
}
