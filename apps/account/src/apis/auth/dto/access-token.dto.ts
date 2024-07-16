import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AccessTokenDto {
  @Field(() => String, { description: 'AccessToken' })
  accessToken: string;
}
