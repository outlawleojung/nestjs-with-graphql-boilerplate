import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ProviderType {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;
}

@ObjectType()
export class Account {
  @Field()
  userId: string;

  @Field()
  password: string;

  @Field()
  email: string;

  @Field(() => ProviderType)
  providerType: ProviderType;
}

@ObjectType()
export class UserDto {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  refreshToken: string;

  @Field(() => [Account])
  accounts: Account[];
}
