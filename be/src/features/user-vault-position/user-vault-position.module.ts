import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserVaultPositionController } from './user-vault-position.controller';
import { UserVaultPositionService } from './user-vault-position.service';
import { UserVaultPosition } from 'src/models/user-vault-position.model';
import { PrivyService } from '../privy/privy.service';
import { IndexerModule } from '../indexer/indexer.module';
import { Vault } from 'src/models/vault.model';
import { User } from 'src/models/user.model';

@Module({
  imports: [
    SequelizeModule.forFeature([UserVaultPosition, Vault, User]),
    IndexerModule,
  ],
  controllers: [UserVaultPositionController],
  providers: [UserVaultPositionService, PrivyService],
  exports: [UserVaultPositionService],
})
export class UserVaultPositionModule {}
