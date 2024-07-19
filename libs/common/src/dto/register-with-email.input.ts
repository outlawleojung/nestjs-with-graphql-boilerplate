import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';

@InputType()
export class RegisterWithEmailInput {
  @IsString()
  @Field(() => String, { description: 'Email' })
  email: string;

  @IsString()
  @Field(() => String, { nullable: true, description: 'Password' })
  password?: string;

  @IsString()
  @Field(() => String, { description: 'Name' })
  name: string;

  @IsNumber()
  @Field(() => Int, { description: 'ProviderTypeId' })
  providerTypeId: number;
}
