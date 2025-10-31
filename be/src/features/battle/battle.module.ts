import { Module } from '@nestjs/common';
import { BattleController } from './battle.controller';
import { BattleService } from './battle.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Battle } from 'src/models/battle.model';
import { Vault } from 'src/models/vault.model';
import { Manager } from 'src/models/manager.model';

@Module({
  imports: [SequelizeModule.forFeature([Battle, Vault, Manager])],
  controllers: [BattleController],
  providers: [BattleService],
})
export class BattleModule {}
