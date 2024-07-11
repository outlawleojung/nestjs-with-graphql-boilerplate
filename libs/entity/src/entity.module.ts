import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import {
  ENV_DATABASE_HOST,
  ENV_DATABASE_NAME,
  ENV_DATABASE_PASSWORD,
  ENV_DATABASE_USER,
} from '@lib/common';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AccountEntity } from '@lib/entity/entities/account.entity';
import { ProviderTypeEntity } from '@lib/entity/entities/provider-type.entity';
import { UserEntity } from '@lib/entity/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env[ENV_DATABASE_HOST],
      username: process.env[ENV_DATABASE_USER],
      password: process.env[ENV_DATABASE_PASSWORD],
      database: process.env[ENV_DATABASE_NAME],
      // entities: [AccountEntity, ProviderTypeEntity, UserEntity],
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: true,
      namingStrategy: new SnakeNamingStrategy(),
    }),
  ],
  providers: [],
  exports: [],
})
export class EntityModule {}
