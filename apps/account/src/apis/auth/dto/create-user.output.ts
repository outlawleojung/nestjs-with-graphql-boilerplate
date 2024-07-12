import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CreateUserOutput {
  @Field(() => String, { description: 'AccessToken' })
  accessToken: string;

  @Field(() => String, { nullable: true, description: 'RefreshToken' })
  refreshToken: string;
}