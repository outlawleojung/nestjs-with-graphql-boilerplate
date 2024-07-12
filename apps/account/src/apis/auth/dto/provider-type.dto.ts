import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ProviderTypeDto {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;
}
