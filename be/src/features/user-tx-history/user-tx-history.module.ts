import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserTxHistory } from 'src/models/usertxhistory.model';
import { UserTxHistoryController } from './user-tx-history.controller';
import { UserTxHistoryService } from './user-tx-history.service';

@Module({
  imports: [SequelizeModule.forFeature([UserTxHistory])],
  controllers: [UserTxHistoryController],
  providers: [UserTxHistoryService],
  exports: [UserTxHistoryService],
})
export class UserTxHistoryModule {}
