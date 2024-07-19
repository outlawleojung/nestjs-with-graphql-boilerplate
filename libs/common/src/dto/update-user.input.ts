import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @IsString()
  @Field({ nullable: true })
  name?: string;
}
