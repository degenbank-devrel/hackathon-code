import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { Cache } from 'cache-manager';
import { UserVaultPosition } from 'src/models/user-vault-position.model';
import { User } from 'src/models/user.model';
import { Vault } from 'src/models/vault.model';
import { Battle } from 'src/models/battle.model';
import { BankService } from '../indexer/degenbank.service';
import { PublicKey } from '@solana/web3.js';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UserVaultPositionService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectModel(UserVaultPosition)
    private readonly userVaultPositionModel: typeof UserVaultPosition,
    @InjectModel(Vault)
    private readonly vaultModel: typeof Vault,
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly bankService: BankService,
  ) {}

  async getUserById(user_id: string): Promise<User | null> {
    const cacheKey = `user:${user_id}`;
    return this.cacheManager.wrap(cacheKey, async () => {
      const user = await this.userModel.findOne({
        where: { user_id },
      });
      return user?.toJSON() || null;
    });
  }

  async getVaultById(vault_id: string): Promise<Vault | null> {
    const cacheKey = `vault:${vault_id}`;
    return this.cacheManager.wrap(cacheKey, async () => {
      const vault = await this.vaultModel.findOne({
        where: { vault_id },
      });
      return vault?.toJSON() || null;
    });
  }

  async getUserVaultPosition(
    user_id: string,
    vault_id: string,
  ): Promise<UserVaultPosition | null> {
    const cacheKey = `user_vault_position:${user_id}:${vault_id}`;
    return this.cacheManager.wrap(cacheKey, () => {
      return this.userVaultPositionModel.findOne({
        where: { user_id, vault_id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['user_id', 'wallet_address'],
          },
          {
            model: Vault,
            as: 'vault',
            attributes: ['vault_id', 'vault_name', 'vault_address'],
          },
        ],
      });
    });
  }

  async getUserVaultPositions(
    user_id: string,
    skip: number = 0,
    limit: number = 10,
  ): Promise<UserVaultPosition[]> {
    const cacheKey = `user_vault_positions:${user_id}:${skip}:${limit}`;
    return this.cacheManager.wrap(cacheKey, () => {
      return this.userVaultPositionModel.findAll({
        where: { user_id },
        include: [
          {
            model: Vault,
            as: 'vault',
            attributes: [
              'vault_id',
              'vault_name',
              'vault_address',
              'vault_strategy',
              'vault_type',
              'vault_image',
              'battle_id',
              'apy',
            ],
          },
        ],
        order: [['created_at', 'DESC']],
        offset: skip,
        limit: limit,
      });
    });
  }

  async getVaultPositions(vault_id: string): Promise<UserVaultPosition[]> {
    const cacheKey = `vault_positions:${vault_id}`;
    return this.cacheManager.wrap(cacheKey, () => {
      return this.userVaultPositionModel.findAll({
        where: { vault_id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['user_id', 'wallet_address'],
          },
        ],
        order: [['vault_shares', 'DESC']],
      });
    });
  }

  async createOrUpdatePosition(
    user_id: string,
    vault_id: string,
    positionData: any,
  ): Promise<UserVaultPosition> {
    const existingPosition = await this.userVaultPositionModel.findOne({
      where: { user_id, vault_id },
    });

    let position: UserVaultPosition;

    if (existingPosition) {
      await existingPosition.update({
        ...positionData,
        last_transaction_at: new Date(),
        updated_at: new Date(),
      });
      position = existingPosition;
    } else {
      position = await this.userVaultPositionModel.create({
        user_id,
        vault_id,
        ...positionData,
        first_deposit_at: new Date(),
        last_transaction_at: new Date(),
      } as any);
    }

    // Clear cache
    await this.cacheManager.del(`user_vault_position:${user_id}:${vault_id}`);
    await this.cacheManager.del(`user_vault_positions:${user_id}`);
    await this.cacheManager.del(`vault_positions:${vault_id}`);

    return position;
  }

  async updatePositionPerformance(
    user_id: string,
    vault_id: string,
    performanceData: {
      current_value?: number;
      high_water_mark?: number;
      max_daily_drawdown?: number;
      total_return_percentage?: number;
      fees_paid?: number;
    },
  ): Promise<UserVaultPosition> {
    const position = await this.userVaultPositionModel.findOne({
      where: { user_id, vault_id },
    });

    if (!position) {
      throw new Error('User vault position not found');
    }

    await position.update({
      ...performanceData,
      updated_at: new Date(),
    });

    // Clear cache
    await this.cacheManager.del(`user_vault_position:${user_id}:${vault_id}`);
    await this.cacheManager.del(`user_vault_positions:${user_id}`);

    return position;
  }

  private validateAndConvertNumber(value: any, fieldName: string): number {
    // Handle null or undefined
    if (value === null || value === undefined) {
      throw new Error(
        `${fieldName} is required and cannot be null or undefined`,
      );
    }

    // Convert to number
    const numValue = Number(value);

    // Check if conversion resulted in NaN
    if (isNaN(numValue)) {
      throw new Error(
        `${fieldName} must be a valid number, received: ${value}`,
      );
    }

    // Check if it's a finite number
    if (!isFinite(numValue)) {
      throw new Error(
        `${fieldName} must be a finite number, received: ${value}`,
      );
    }

    // Check if it's negative (amounts should be positive)
    if (numValue < 0) {
      throw new Error(
        `${fieldName} must be a positive number, received: ${numValue}`,
      );
    }

    return numValue;
  }

  @OnEvent('new.deposit')
  async newDepostEvent(data: any) {
    const eventData = data as {
      user_id: string;
      vault_id: string;
      amount: number;
      shares_received: number;
      tx_hash: string;
    };

    await this.recordDeposit(
      eventData.user_id,
      eventData.vault_id,
      eventData.amount,
      eventData.shares_received,
      eventData.tx_hash,
    );
  }

  async recordDeposit(
    user_id: string,
    vault_id: string,
    amount: number,
    shares_received: number,
    tx_hash: string,
  ): Promise<UserVaultPosition> {
    // Validate and convert input parameters
    const validAmount = this.validateAndConvertNumber(amount, 'amount');

    const position = await this.getUserVaultPosition(user_id, vault_id);

    const [vault, user] = await Promise.all([
      this.getVaultById(vault_id),
      this.getUserById(user_id),
    ]);

    if (!vault) {
      throw new Error('Vault not found');
    }

    if (!user) {
      throw new Error('User not found');
    }

    const balance = await this.bankService.getSplTokenBalance(
      new PublicKey(vault.vault_token_mint || ''),
      new PublicKey(user.wallet_address || ''),
    );

    const vaultBalance = await this.bankService.getSplTokenBalanceFromAccount(
      new PublicKey(vault.vault_token_address || ''),
    );

    const supply = await this.bankService.getSplTotalSupply(
      new PublicKey(vault.vault_token_mint || ''),
    );

    const totalSupply = supply?.uiAmount || 0;

    // Safely calculate new values with proper fallbacks
    const currentVaultShares = balance?.uiAmount ? balance?.uiAmount : 0;
    const currentCumulativeDeposits = position?.cumulative_deposits
      ? Number(position.cumulative_deposits)
      : 0;
    const currentValue =
      vaultBalance?.uiAmount && totalSupply > 0 && currentVaultShares > 0
        ? (Number(vaultBalance?.uiAmount) * currentVaultShares) / totalSupply
        : 0;

    const updatedData = {
      vault_shares: currentVaultShares,
      cumulative_deposits: currentCumulativeDeposits + validAmount,
      current_value: currentValue,
      tx_hash: tx_hash,
    };

    return this.createOrUpdatePosition(user_id, vault_id, updatedData);
  }

  @OnEvent('new.withdrawal')
  async newWithdrawalEvent(data: any) {
    const eventData = data as {
      user_id: string;
      vault_id: string;
      amount: number;
      shares_burned: number;
      tx_hash: string;
    };

    await this.recordWithdrawal(
      eventData.user_id,
      eventData.vault_id,
      eventData.amount,
      eventData.shares_burned,
      eventData.tx_hash,
    );
  }

  async recordWithdrawal(
    user_id: string,
    vault_id: string,
    amount: number,
    shares_burned: number,
    tx_hash: string,
  ): Promise<UserVaultPosition> {
    // Validate and convert input parameters
    const validAmount = this.validateAndConvertNumber(amount, 'amount');
    const validSharesBurned = this.validateAndConvertNumber(
      shares_burned,
      'shares_burned',
    );

    const vault = await this.vaultModel.findOne({
      where: { vault_id },
      include: [
        {
          model: Battle,
          as: 'battle',
          attributes: ['battle_id', 'current_phase', 'status'],
        },
      ],
    });

    if (!vault) {
      throw new Error('Vault not found');
    }

    // Allow withdrawals if:
    // 1. Vault has no associated battle, OR
    // 2. Battle is completed, OR
    // 3. Battle status allows withdrawals
    if (vault.battle) {
      const battlePhase = vault.battle.current_phase?.toLowerCase();
      const battleStatus = vault.battle.status?.toLowerCase();

      // Only restrict withdrawals during active battle phase
      if (battlePhase === 'battle_phase' && battleStatus === 'ongoing_battle') {
        throw new Error(
          'Withdrawals are not allowed during active battle phase',
        );
      }
    }

    const position = await this.getUserVaultPosition(user_id, vault_id);

    if (!position && !vault) {
      throw new Error('User vault position not found');
    }

    // Safely calculate new values with proper fallbacks
    const currentVaultShares = position?.vault_shares
      ? Number(position.vault_shares)
      : 0;
    const currentCumulativeWithdrawals = position?.cumulative_withdrawals
      ? Number(position.cumulative_withdrawals)
      : 0;
    const currentValue = position?.current_value
      ? Number(position.current_value)
      : 0;

    const updatedData = {
      vault_shares: Math.max(0, currentVaultShares - validSharesBurned),
      cumulative_withdrawals: currentCumulativeWithdrawals + validAmount,
      current_value: Math.max(0, currentValue - validAmount),
      tx_hash: tx_hash,
    };

    return this.createOrUpdatePosition(user_id, vault_id, updatedData);
  }
}
