import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import {
  AccountEntity,
  EntityModule,
  ProviderTypeEntity,
  UserEntity,
} from '@lib/entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ProviderTypeEntity, AccountEntity]),
    EntityModule,
  ],
  providers: [AuthResolver, AuthService],
})
export class AuthModule {}
