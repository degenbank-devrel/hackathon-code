import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Vault } from 'src/models/vault.model';
import { VaultController } from './vault.controller';
import { VaultService } from './vault.service';
import { VaultAnalytic } from 'src/models/vaultanalytics.model';

@Module({
  imports: [SequelizeModule.forFeature([Vault, VaultAnalytic])],
  controllers: [VaultController],
  providers: [VaultService],
})
export class VaultModule {}
