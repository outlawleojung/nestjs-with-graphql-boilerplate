import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType()
export class TokenOutput {
  @Field(() => String, { description: 'AccessToken' })
  accessToken: string;

  @Field(() => String, { nullable: true, description: 'RefreshToken' })
  refreshToken: string;
}
