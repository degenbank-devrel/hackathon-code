import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { Cache } from 'cache-manager';
import { Manager } from 'src/models/manager.model';

@Injectable()
export class ManagerService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectModel(Manager) private readonly managerModel: typeof Manager,
  ) {}

  async getManagerById(manager_id: string): Promise<Manager | null> {
    return this.cacheManager.wrap(`manager_${manager_id}`, () => {
      return this.managerModel.findOne({
        where: {
          manager_id: manager_id,
        },
      });
    });
  }

  async getAllManagers(skip: number, limit: number) {
    const { rows: managers, count: total } = await this.cacheManager.wrap(
      `managers_${skip}_${limit}`,
      () => {
        return this.managerModel.findAndCountAll({
          offset: skip,
          limit: limit,
          order: [['is_kyb', 'DESC']],
        });
      },
    );
    return { managers, total };
  }
}
