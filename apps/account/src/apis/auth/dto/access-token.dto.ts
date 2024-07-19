import { Field, ObjectType, createUnionType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@ObjectType()
export class TokenResponseDto {
  @IsString()
  @Field()
  accessToken?: string;

  @IsString()
  @Field()
  refreshToken?: string;
}
