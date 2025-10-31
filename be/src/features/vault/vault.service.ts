import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { Cache } from 'cache-manager';
import { Vault } from 'src/models/vault.model';
import { Manager } from 'src/models/manager.model';
import { Battle } from 'src/models/battle.model';
import { VaultAnalytic } from 'src/models/vaultanalytics.model';
import { Op } from 'sequelize';

@Injectable()
export class VaultService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectModel(Vault) private readonly vaultModel: typeof Vault,
    @InjectModel(VaultAnalytic)
    private readonly vaultAnalyticModel: typeof VaultAnalytic,
  ) {}

  async getVaultById(vault_id: string): Promise<Vault | null> {
    return this.cacheManager.wrap(`vault_${vault_id}`, () => {
      return this.vaultModel.findOne({
        where: {
          vault_id: vault_id,
        },
      });
    });
  }

  async getAllVaults(
    skip: number = 0,
    limit: number = 10,
  ): Promise<{ vaults: Vault[]; total: number }> {
    const cacheKey = `vaults:all:${skip}:${limit}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached as { vaults: Vault[]; total: number };
    }

    const { count, rows } = await this.vaultModel.findAndCountAll({
      offset: skip,
      limit,
      include: [
        {
          model: Manager,
          as: 'manager',
        },
        {
          model: Battle,
          as: 'battle',
        },
      ],
    });

    const result = { vaults: rows, total: count };
    await this.cacheManager.set(cacheKey, result, 300000); // 5 minutes

    return result;
  }

  async getVaultsByBattleId(battle_id: number): Promise<Vault[]> {
    const cacheKey = `vaults:battle:${battle_id}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached as Vault[];
    }

    const vaults = await this.vaultModel.findAll({
      where: { battle_id },
      include: [
        {
          model: Manager,
          as: 'manager',
          attributes: ['manager_id', 'manager_name', 'wallet_address'],
        },
        {
          model: Battle,
          as: 'battle',
          attributes: ['battle_id', 'battle_name', 'status'],
        },
      ],
      order: [['vault_id', 'ASC']], // Changed from current_roi since that field was removed
    });

    await this.cacheManager.set(cacheKey, vaults, 60000); // 1 minute for battle data

    return vaults;
  }

  async getVaultPerformance(
    vault_id: string,
    period: string = '14D',
  ): Promise<any> {
    // Validate period parameter
    if (!['14D', '30D'].includes(period)) {
      throw new Error('Invalid period. Only 14D and 30D are supported.');
    }

    const cacheKey = `vault:performance:${vault_id}:${period}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    // Generate performance data according to API specification
    const data = this.generateMockPerformanceData(period);

    // Calculate summary statistics from the generated data
    const values = data.map((item) => item.value);

    const initialValue = 1000; // Base value
    const finalValue = values[values.length - 1];
    const totalReturn = ((finalValue - initialValue) / initialValue) * 100;

    // Calculate volatility (standard deviation of daily returns)
    const dailyReturns: number[] = [];
    for (let i = 1; i < values.length; i++) {
      const dailyReturn = (values[i] - values[i - 1]) / values[i - 1];
      dailyReturns.push(dailyReturn);
    }
    const avgReturn =
      dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
    const variance =
      dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) /
      dailyReturns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // Annualized volatility

    // Calculate Sharpe ratio (assuming risk-free rate of 2%)
    const riskFreeRate = 0.02;
    const excessReturn = totalReturn / 100 - riskFreeRate;
    const sharpeRatio = excessReturn / (volatility / 100);

    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = values[0];
    for (const value of values) {
      if (value > peak) {
        peak = value;
      }
      const drawdown = (peak - value) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    maxDrawdown = -maxDrawdown * 100; // Convert to negative percentage

    const performanceData = {
      period,
      data,
      summary: {
        totalReturn,
        volatility,
        sharpeRatio,
        maxDrawdown,
      },
    };

    await this.cacheManager.set(cacheKey, performanceData, 300000); // 5 minutes

    return performanceData;
  }

  async updateVaultPerformance(
    vault_id: string,
    performanceData: any,
  ): Promise<Vault> {
    const vault = await this.vaultModel.findByPk(vault_id);

    if (!vault) {
      throw new Error('Vault not found');
    }

    // Note: Performance fields have been removed from the model
    // This method may need to be updated or removed entirely
    // For now, only update basic vault information
    const allowedFields = {
      vault_name: performanceData.vault_name,
      vault_description: performanceData.vault_description,
      vault_strategy: performanceData.vault_strategy,
    };

    // Filter out undefined values
    const updateData = Object.fromEntries(
      Object.entries(allowedFields).filter(([, value]) => value !== undefined),
    );

    if (Object.keys(updateData).length > 0) {
      await vault.update(updateData);
    }

    // Clear cache
    await this.cacheManager.del(`vault:${vault_id}`);
    await this.cacheManager.del(`vaults:battle:${vault.battle_id}`);

    return vault;
  }

  private generateMockPerformanceData(period: string): any[] {
    const days = period === '30D' ? 30 : 14;
    const data: any[] = [];
    let baseValue = 1000;

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));

      // Simulate daily performance with some volatility
      const dailyChange = (Math.random() - 0.5) * 0.04; // -2% to +2% daily
      baseValue *= 1 + dailyChange;

      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(baseValue * 100) / 100,
        roi: Math.round(((baseValue - 1000) / 1000) * 10000) / 100,
        sharePrice: Math.round((baseValue / 1000) * 10000) / 10000,
        vaultBalance:
          Math.round(baseValue * (Math.random() * 0.2 + 0.9) * 100) / 100,
      });
    }

    return data;
  }

  async getVaultAnalyticsByDateRange(
    vault_id: string,
    startDate: Date,
    endDate: Date,
  ): Promise<VaultAnalytic[]> {
    const cacheKey = `vault_analytics:${vault_id}:${startDate.toISOString()}:${endDate.toISOString()}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached as VaultAnalytic[];
    }

    const analytics = await this.vaultAnalyticModel.findAll({
      where: {
        vault_id,
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [['date', 'ASC']],
    });

    await this.cacheManager.set(cacheKey, analytics, 300000); // 5 minutes

    return analytics;
  }
}
