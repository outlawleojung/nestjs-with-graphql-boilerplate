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

  @Field({ nullable: true })
  password?: string | null;

  @Field()
  email: string;

  @Field({ nullable: true })
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

  @Field({ nullable: true })
  refreshToken: string;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  profileImg: string;

  @Field(() => [AccountDto])
  accounts?: AccountDto[];
}
