import { Module } from '@nestjs/common';
import { IndexerService } from './indexer.service';
import { BullModule } from '@nestjs/bullmq';
import { NewTxsProcessor } from './txs.processor';
import { HttpModule } from '@nestjs/axios';
import { BankService } from './degenbank.service';
import { IndexerController } from './indexer.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Battle } from 'src/models/battle.model';
import { Manager } from 'src/models/manager.model';
import { Vault } from 'src/models/vault.model';
import { WebhookTx } from 'src/models/webhooktxs.model';
import { Price } from 'src/models/price.model';
import { Token } from 'src/models/token.model';
import { VaultBalance } from 'src/models/vaultbalance.model';
import { Balance } from 'src/models/balance.model';
import { UserTxHistory } from 'src/models/usertxhistory.model';
import { User } from 'src/models/user.model';
import { TradingService } from './trading.service';
import { VaultAnalytic } from 'src/models/vaultanalytics.model';
import { UserVaultPosition } from 'src/models/user-vault-position.model';

@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({
      name: 'new-txs',
    }),
    SequelizeModule.forFeature([
      Battle,
      Manager,
      Vault,
      Balance,
      VaultBalance,
      VaultAnalytic,
      Token,
      WebhookTx,
      Price,
      UserTxHistory,
      UserVaultPosition,
      User,
    ]),
  ],
  providers: [IndexerService, NewTxsProcessor, BankService, TradingService],
  // remove demo from production
  controllers: [IndexerController],
  exports: [BankService, NewTxsProcessor],
})
export class IndexerModule {}
