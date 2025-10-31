import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { CacheableMemory, Keyv } from 'cacheable';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import models from './models';
import { UserModule } from './features/user/user.module';
import { ManagerModule } from './features/manager/manager.module';
import { VaultModule } from './features/vault/vault.module';
import { BattleModule } from './features/battle/battle.module';
import { IndexerModule } from './features/indexer/indexer.module';
import { TokenModule } from './features/token/token.module';
import { UserVaultPositionModule } from './features/user-vault-position/user-vault-position.module';
import { CommentModule } from './features/comment/comment.module';
import { UserTxHistoryModule } from './features/user-tx-history/user-tx-history.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: 3000,
        isGlobal: true,
        stores: [
          new KeyvRedis(
            `redis://:${configService.get<string>('REDIS_PASSWORD')}@${configService.get<string>('REDIS_HOST')}:${configService.get<string>('REDIS_PORT')}`,
          ),
          new Keyv({
            store: new CacheableMemory({ ttl: 3000, lruSize: 5000 }),
          }),
        ],
      }),
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        models,
        autoLoadModels: false,
        synchronize: false,
        pool: {
          max: 10,
          min: 0,
          acquire: 120000,
          idle: 30000,
          evict: 20000,
        },
        dialectOptions: {
          connectTimeout: 60000,
        },
        logging: true,
        logQueryParameters: true,
        logSlowQueries: true,
        benchmark: true,
        retry: {
          match: [
            /ETIMEDOUT/,
            /EHOSTUNREACH/,
            /ECONNRESET/,
            /ECONNREFUSED/,
            /ESOCKETTIMEDOUT/,
            /socket ETIMEDOUT/,
            'TimeoutError',
            'SequelizeConnectionAcquireTimeoutError',
          ],
          max: 3,
          backoffBase: 1000,
          backoffExponent: 1.5,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
    }),
    ScheduleModule.forRoot(),
    UserModule,
    ManagerModule,
    VaultModule,
    BattleModule,
    TokenModule,
    IndexerModule,
    UserVaultPositionModule,
    CommentModule,
    UserTxHistoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
