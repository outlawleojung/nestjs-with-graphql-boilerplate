import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ProviderTypeDto {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;
}

@ObjectType()
export class AccountDto {
  @Field()
  id: number;

  @Field()
  userId: string;

  @Field()
  providerTypeId: number;

  @Field()
  password?: string | null;

  @Field()
  email: string;

  @Field()
  socialToken?: string;

  @Field(() => ProviderTypeDto)
  providerType: ProviderTypeDto;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class UserDto {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  refreshToken: string;

  @Field()
  createdAt: Date;

  @Field(() => [AccountDto])
  accounts?: AccountDto[];
}
