import { Field, Int, InputType } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';

@InputType()
export class CheckUserRegisterInput {
  @IsString()
  @Field(() => String)
  idToken: string;

  @IsNumber()
  @Field(() => Int)
  providerTypeId: number;
}
