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
import { TokenService } from '@lib/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AccountEntity, ProviderTypeEntity]),
    EntityModule,
  ],
  providers: [
    AuthResolver,
    AuthService,
    TokenService,
    UserEntityRepository,
    AccountEntityRepository,
  ],
})
export class AuthModule {}
