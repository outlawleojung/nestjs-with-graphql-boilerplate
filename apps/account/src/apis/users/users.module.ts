import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AccountEntity,
  EntityModule,
  ProviderTypeEntity,
  UserEntity,
  UserEntityRepository,
} from '@lib/entity';
import { CommonModule, TokenService, TokenUtilsService } from '@lib/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AccountEntity, ProviderTypeEntity]),
    EntityModule,
    CommonModule,
  ],
  providers: [
    UsersResolver,
    UsersService,
    TokenService,
    TokenUtilsService,
    UserEntityRepository,
  ],
})
export class UsersModule {}
