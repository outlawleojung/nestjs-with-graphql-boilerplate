import { InputType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class LoginWithEmailInput {
  @IsString()
  @Field(() => String, { description: 'Email' })
  email: string;

  @IsString()
  @Field(() => String, { nullable: true, description: 'Password' })
  password?: string;
}
