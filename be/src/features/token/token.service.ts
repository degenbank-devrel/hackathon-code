import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { Cache } from 'cache-manager';
import { Token } from 'src/models/token.model';

@Injectable()
export class TokenService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectModel(Token) private readonly tokenModel: typeof Token,
  ) {}

  async getTokenById(token_id: string): Promise<Token | null> {
    const cacheKey = `token_${token_id}`;
    return this.cacheManager.wrap(cacheKey, () => {
      return this.tokenModel.findOne({
        where: { token_id: token_id },
      });
    });
  }

  async getTokenByAddress(token_address: string): Promise<Token | null> {
    const cacheKey = `token_${token_address}`;
    return this.cacheManager.wrap(cacheKey, () => {
      return this.tokenModel.findOne({
        where: { token_address: token_address },
      });
    });
  }

  async getTokens(
    network: string,
    skip: number,
    limit: number,
  ): Promise<Token[]> {
    const cacheKey = `tokens_${network}_${skip}_${limit}`;
    return this.cacheManager.wrap(cacheKey, () => {
      return this.tokenModel.findAll({
        where: { network },
        offset: skip,
        limit,
      });
    });
  }
}
