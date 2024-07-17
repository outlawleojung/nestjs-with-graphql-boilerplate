import { AccountEntity, ProviderTypeEntity, UserEntity } from '@lib/entity';
import { AccountDto, ProviderTypeDto, UserDto } from '@lib/common';

export const toProviderTypeDTO = (
  entity: ProviderTypeEntity,
  selectedFields: string[],
): Partial<ProviderTypeDto> => {
  const providerTypeDto: Partial<ProviderTypeDto> = {};
  console.log('selectedFields in toProviderTypeDTO: ', selectedFields);

  if (selectedFields.includes('id')) {
    providerTypeDto.id = entity.id;
  }
  if (selectedFields.includes('name')) {
    providerTypeDto.name = entity.name;
  }

  console.log('providerTypeDto: ', providerTypeDto);
  return providerTypeDto;
};

export const toAccountDTO = (
  entity: AccountEntity,
  selectedFields: string[] = [],
): AccountDto => {
  console.log('toAccountDTO selectedFields: ', selectedFields);

  const partialAccountDto: Partial<AccountDto> = {};
  if (selectedFields.includes('accounts.id')) {
    partialAccountDto.id = entity.id;
  }
  if (selectedFields.includes('accounts.userId')) {
    partialAccountDto.userId = entity.userId;
  }
  if (selectedFields.includes('accounts.password')) {
    partialAccountDto.password = entity.password;
  }
  if (selectedFields.includes('accounts.email')) {
    partialAccountDto.email = entity.email;
  }
  if (selectedFields.includes('accounts.createdAt')) {
    partialAccountDto.createdAt = entity.createdAt;
  }
  if (selectedFields.includes('accounts.providerTypeId')) {
    partialAccountDto.providerTypeId = entity.providerTypeId;
  }

  const providerTypeFields = selectedFields.filter((field) =>
    field.startsWith('accounts.providerType.'),
  );
  if (providerTypeFields.length > 0) {
    partialAccountDto.providerType = toProviderTypeDTO(
      entity.providerType,
      providerTypeFields.map((field) =>
        field.replace('accounts.providerType.', ''),
      ),
    ) as ProviderTypeDto;
  }

  return partialAccountDto as AccountDto;
};

export const toUserDTO = (
  entity: UserEntity,
  selectedFields: string[],
): Partial<UserDto> => {
  console.log('toUserDTO selectedFields: ', selectedFields);
  const userDto: Partial<UserDto> = {};
  if (selectedFields.includes('id')) {
    userDto.id = entity.id;
  }
  if (selectedFields.includes('name')) {
    userDto.name = entity.name;
  }
  if (selectedFields.includes('refreshToken')) {
    userDto.refreshToken = entity.refreshToken;
  }
  if (selectedFields.includes('createdAt')) {
    userDto.createdAt = entity.createdAt;
  }
  const accountFields = selectedFields.filter((field) =>
    field.startsWith('accounts.'),
  );
  if (accountFields.length > 0) {
    userDto.accounts = entity.accounts.map((account) =>
      toAccountDTO(account, accountFields),
    );
  }
  console.log('userDto : ', userDto as UserDto);
  return userDto as UserDto;
};
