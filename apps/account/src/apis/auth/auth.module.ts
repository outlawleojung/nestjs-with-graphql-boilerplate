import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import {
  AccountEntity,
  AccountEntityRepository,
  EntityModule,
  ProviderTypeEntity,
  UserEntity,
  UserEntityRepository,
} from '@lib/entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CommonModule,
  CommonService,
  TokenService,
  TokenUtilsService,
  UserValidationService,
} from '@lib/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AccountEntity, ProviderTypeEntity]),
    EntityModule,
    CommonModule,
  ],
  providers: [
    AuthResolver,
    AuthService,
    TokenService,
    TokenUtilsService,
    UserEntityRepository,
    AccountEntityRepository,
    UserValidationService,
  ],
})
export class AuthModule {}
