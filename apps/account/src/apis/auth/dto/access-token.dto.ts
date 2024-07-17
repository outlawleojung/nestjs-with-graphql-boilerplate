import { Field, ObjectType, createUnionType } from '@nestjs/graphql';

@ObjectType()
export class TokenResponseDto {
  @Field()
  accessToken?: string;

  @Field()
  refreshToken?: string;
}
