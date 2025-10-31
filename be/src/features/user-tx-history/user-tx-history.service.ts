import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { Cache } from 'cache-manager';
import { UserTxHistory } from 'src/models/usertxhistory.model';
import { User } from 'src/models/user.model';
import { Vault } from 'src/models/vault.model';

@Injectable()
export class UserTxHistoryService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectModel(UserTxHistory)
    private readonly userTxHistoryModel: typeof UserTxHistory,
  ) {}

  async getUserTxHistory(
    user_id: string,
    skip: number,
    limit: number,
  ): Promise<{ histories: UserTxHistory[]; total: number }> {
    const { rows: histories, count: total } = await this.cacheManager.wrap(
      `user_tx_history_${user_id}_${skip}_${limit}`,
      () => {
        return this.userTxHistoryModel.findAndCountAll({
          where: { user_id },
          include: [
            {
              model: User,
              attributes: ['user_id', 'fullname', 'wallet_address'],
            },
            {
              model: Vault,
              attributes: ['vault_id', 'vault_name', 'description'],
            },
          ],
          offset: skip,
          limit: limit,
          order: [['transactionDate', 'DESC']],
        });
      },
      300, // 5 minutes cache
    );
    return { histories, total };
  }

  async getTxHistoryById(tx_id: string): Promise<UserTxHistory | null> {
    return this.cacheManager.wrap(
      `tx_history_${tx_id}`,
      () => {
        return this.userTxHistoryModel.findOne({
          where: { tx_id },
          include: [
            {
              model: User,
              attributes: ['user_id', 'fullname', 'wallet_address'],
            },
            {
              model: Vault,
              attributes: ['vault_id', 'vault_name', 'description'],
            },
          ],
        });
      },
      3600, // 1 hour cache
    );
  }

  async getAllTxHistory(
    skip: number,
    limit: number,
  ): Promise<{ histories: UserTxHistory[]; total: number }> {
    const { rows: histories, count: total } = await this.cacheManager.wrap(
      `all_tx_history_${skip}_${limit}`,
      () => {
        return this.userTxHistoryModel.findAndCountAll({
          include: [
            {
              model: User,
              attributes: ['user_id', 'fullname', 'wallet_address'],
            },
            {
              model: Vault,
              attributes: ['vault_id', 'vault_name', 'description'],
            },
          ],
          offset: skip,
          limit: limit,
          order: [['transactionDate', 'DESC']],
        });
      },
      300, // 5 minutes cache
    );
    return { histories, total };
  }
}
