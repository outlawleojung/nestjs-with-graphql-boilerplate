// account.dto.ts
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ProviderTypeDto } from './provider-type.dto';

@ObjectType()
export class AccountDto {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field(() => ProviderTypeDto)
  providerType: ProviderTypeDto;
}
