import { AccountEntity, ProviderTypeEntity, UserEntity } from '@lib/entity';
import { AccountDto, ProviderTypeDto, UserDto } from '@lib/common';

export const toProviderTypeDTO = (
  entity: ProviderTypeEntity,
): ProviderTypeDto => ({
  id: entity.id,
  name: entity.name,
});

export const toAccountDTO = (entity: AccountEntity): AccountDto => ({
  userId: entity.userId,
  password: entity.password,
  email: entity.email,
  createdAt: entity.createdAt,
  providerTypeId: entity.providerTypeId,
  providerType: toProviderTypeDTO(entity.providerType),
});

export const toUserDTO = (entity: UserEntity): UserDto => ({
  id: entity.id,
  name: entity.name,
  refreshToken: entity.refreshToken,
  createdAt: entity.createdAt,
  accounts: entity.accounts ? entity.accounts.map(toAccountDTO) : [],
});
