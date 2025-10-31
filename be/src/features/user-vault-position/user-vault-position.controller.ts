import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserVaultPositionService } from './user-vault-position.service';
import { ObjectResponse } from 'src/dto/response.dto';
import { UserVaultPosition } from 'src/models/user-vault-position.model';
import { PrivyGuard } from 'src/guards/privy.guard';

@ApiTags('User Vault Position')
@Controller('user-vault-position')
export class UserVaultPositionController {
  constructor(
    private readonly userVaultPositionService: UserVaultPositionService,
  ) {}

  @Get('user/:user_id/vault/:vault_id')
  @ApiOperation({ summary: 'Get user vault position by user ID and vault ID' })
  @ApiParam({
    name: 'user_id',
    type: 'string',
    description: 'UUID of the user',
  })
  @ApiParam({
    name: 'vault_id',
    type: 'string',
    description: 'UUID of the vault',
  })
  @ApiResponse({
    status: 200,
    description: 'User vault position found',
    type: ObjectResponse,
  })
  @ApiResponse({ status: 404, description: 'User vault position not found' })
  async getUserVaultPosition(
    @Param('user_id') user_id: string,
    @Param('vault_id') vault_id: string,
  ): Promise<ObjectResponse<UserVaultPosition | null>> {
    const position = await this.userVaultPositionService.getUserVaultPosition(
      user_id,
      vault_id,
    );
    return new ObjectResponse(
      position,
      position ? 'User vault position found' : 'User vault position not found',
      position ? 200 : 404,
    );
  }

  @Get('user/:user_id')
  @ApiOperation({
    summary: 'Get all vault positions for a user with pagination',
  })
  @ApiParam({
    name: 'user_id',
    type: 'string',
    description: 'UUID of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'User vault positions retrieved successfully',
    type: ObjectResponse,
  })
  async getUserVaultPositions(
    @Param('user_id') user_id: string,
    @Query('skip') skip: number = 0,
    @Query('limit') limit: number = 10,
  ): Promise<ObjectResponse<UserVaultPosition[]>> {
    const positions = await this.userVaultPositionService.getUserVaultPositions(
      user_id,
      skip,
      limit,
    );
    return new ObjectResponse(
      positions,
      'User vault positions retrieved successfully',
    );
  }

  @Get('vault/:vault_id')
  @ApiOperation({ summary: 'Get all user positions for a vault' })
  @ApiParam({
    name: 'vault_id',
    type: 'string',
    description: 'UUID of the vault',
  })
  @ApiResponse({
    status: 200,
    description: 'Vault positions retrieved successfully',
    type: ObjectResponse,
  })
  async getVaultPositions(
    @Param('vault_id') vault_id: string,
  ): Promise<ObjectResponse<UserVaultPosition[]>> {
    const positions =
      await this.userVaultPositionService.getVaultPositions(vault_id);
    return new ObjectResponse(
      positions,
      'Vault positions retrieved successfully',
    );
  }

  @Post('user/:user_id/vault/:vault_id/deposit')
  @UseGuards(PrivyGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record a deposit transaction' })
  @ApiParam({
    name: 'user_id',
    type: 'string',
    description: 'UUID of the user',
  })
  @ApiParam({
    name: 'vault_id',
    type: 'string',
    description: 'UUID of the vault',
  })
  @ApiBody({
    description: 'Deposit transaction data',
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', description: 'Deposit amount' },
        shares_received: {
          type: 'number',
          description: 'Vault shares received',
        },
        tx_hash: {
          type: 'string',
          description: 'Transaction hash from blockchain',
        },
      },
      required: ['amount', 'shares_received', 'tx_hash'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Deposit recorded successfully',
    type: ObjectResponse,
  })
  async recordDeposit(
    @Param('user_id') user_id: string,
    @Param('vault_id') vault_id: string,
    @Body()
    depositData: { amount: number; shares_received: number; tx_hash: string },
  ): Promise<ObjectResponse<UserVaultPosition>> {
    const position = await this.userVaultPositionService.recordDeposit(
      user_id,
      vault_id,
      depositData.amount,
      depositData.shares_received,
      depositData.tx_hash,
    );
    return new ObjectResponse(position, 'Deposit recorded successfully');
  }

  @Post('user/:user_id/vault/:vault_id/withdrawal')
  @UseGuards(PrivyGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record a withdrawal transaction' })
  @ApiParam({
    name: 'user_id',
    type: 'string',
    description: 'UUID of the user',
  })
  @ApiParam({
    name: 'vault_id',
    type: 'string',
    description: 'UUID of the vault',
  })
  @ApiBody({
    description: 'Withdrawal transaction data',
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', description: 'Withdrawal amount' },
        shares_burned: {
          type: 'number',
          description: 'Vault shares burned',
        },
        tx_hash: {
          type: 'string',
          description: 'Transaction hash from blockchain',
        },
      },
      required: ['amount', 'shares_burned', 'tx_hash'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal recorded successfully',
    type: ObjectResponse,
  })
  async recordWithdrawal(
    @Param('user_id') user_id: string,
    @Param('vault_id') vault_id: string,
    @Body()
    withdrawalData: {
      amount: number;
      shares_burned: number;
      tx_hash: string;
    },
  ): Promise<ObjectResponse<UserVaultPosition>> {
    const position = await this.userVaultPositionService.recordWithdrawal(
      user_id,
      vault_id,
      withdrawalData.amount,
      withdrawalData.shares_burned,
      withdrawalData.tx_hash,
    );
    return new ObjectResponse(position, 'Withdrawal recorded successfully');
  }

  @Put('user/:user_id/vault/:vault_id/performance')
  @UseGuards(PrivyGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user vault position performance data' })
  @ApiParam({
    name: 'user_id',
    type: 'string',
    description: 'UUID of the user',
  })
  @ApiParam({
    name: 'vault_id',
    type: 'string',
    description: 'UUID of the vault',
  })
  @ApiBody({
    description: 'Performance update data',
    schema: {
      type: 'object',
      properties: {
        current_value: { type: 'number' },
        high_water_mark: { type: 'number' },
        max_daily_drawdown: { type: 'number' },
        total_return_percentage: { type: 'number' },
        fees_paid: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Performance updated successfully',
    type: ObjectResponse,
  })
  async updatePositionPerformance(
    @Param('user_id') user_id: string,
    @Param('vault_id') vault_id: string,
    @Body()
    performanceData: {
      current_value?: number;
      high_water_mark?: number;
      max_daily_drawdown?: number;
      total_return_percentage?: number;
      fees_paid?: number;
    },
  ): Promise<ObjectResponse<UserVaultPosition>> {
    const position =
      await this.userVaultPositionService.updatePositionPerformance(
        user_id,
        vault_id,
        performanceData,
      );
    return new ObjectResponse(position, 'Performance updated successfully');
  }
}
