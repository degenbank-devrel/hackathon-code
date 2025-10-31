import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { Cache } from 'cache-manager';
import { Battle } from 'src/models/battle.model';

@Injectable()
export class BattleService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectModel(Battle) private readonly battleModel: typeof Battle,
  ) {}

  async getBattleById(battleId: string): Promise<Battle | null> {
    return this.cacheManager.wrap(`battle_${battleId}`, async () => {
      return await this.battleModel.findOne({
        where: {
          battle_id: battleId,
        },
      });
    });
  }

  async getAllBattles(skip: number, limit: number) {
    const { rows: battles, count: total } = await this.cacheManager.wrap(
      `battles_${skip}_${limit}`,
      () => {
        return this.battleModel.findAndCountAll({
          offset: skip,
          limit: limit,
          order: [['battle_start', 'DESC']],
        });
      },
    );
    return { battles, total };
  }
}
