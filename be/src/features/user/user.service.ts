import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { Cache } from 'cache-manager';
import { CreateUserDto } from 'src/dto/user.dto';
import { User } from 'src/models/user.model';

@Injectable()
export class UserService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  async getUserById(user_id: string): Promise<User | null> {
    return this.cacheManager.wrap(
      `user_${user_id}`,
      () => {
        return this.userModel.findByPk(user_id);
      },
      3600,
    );
  }

  async getUserByPrivyId(privyId: string): Promise<User | null> {
    return this.cacheManager.wrap(`user_privy_${privyId}`, () => {
      return this.userModel.findOne({
        where: { privy_id: privyId },
      });
    });
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | null> {
    return this.cacheManager.wrap(`user_wallet_${walletAddress}`, () => {
      return this.userModel.findOne({
        where: { wallet_address: walletAddress },
      });
    });
  }

  async getAllUsers(skip: number, limit: number) {
    const { rows: users, count: total } = await this.cacheManager.wrap(
      `users_${skip}_${limit}`,
      () => {
        return this.userModel.findAndCountAll({
          offset: skip,
          limit: limit,
          order: [['fullname', 'DESC']],
        });
      },
    );
    return { users, total };
  }

  async createOrGetUser(
    createUserDto: CreateUserDto,
    privyId: string,
  ): Promise<{ user: User; isNewUser: boolean }> {
    const existingUser = await this.userModel.findOne({
      where: { privy_id: privyId },
    });

    if (existingUser) {
      return { user: existingUser, isNewUser: false };
    }

    if (createUserDto.email) {
      const existingUserByEmail = await this.userModel.findOne({
        where: { email: createUserDto.email },
      });
      if (existingUserByEmail) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const existingUserByWallet = await this.userModel.findOne({
      where: { wallet_address: createUserDto.walletAddress },
    });
    if (existingUserByWallet) {
      throw new ConflictException(
        'User with this wallet address already exists',
      );
    }

    const newUser = await this.userModel.create({
      ...createUserDto,
      wallet_address: createUserDto.walletAddress,
      privy_id: privyId,
    });

    await this.cacheManager.del(`user_${newUser.user_id}`);
    await this.cacheManager.del(`user_privy_${privyId}`);

    return { user: newUser, isNewUser: true };
  }
}
