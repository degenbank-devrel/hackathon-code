import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { VaultService } from './vault.service';
import { ObjectResponse } from 'src/dto/response.dto';
import { Vault } from 'src/models/vault.model';
import { VaultAnalytic } from 'src/models/vaultanalytics.model';

@ApiTags('Vault')
@Controller('vault')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Get(':vaultId')
  @ApiOperation({ summary: 'Get vault by ID' })
  @ApiParam({
    name: 'vaultId',
    type: 'number',
    description: 'ID of the vault',
  })
  @ApiResponse({
    status: 200,
    description: 'Vault found',
    type: ObjectResponse,
  })
  @ApiResponse({ status: 404, description: 'Vault not found' })
  async getVaultById(
    @Param('vaultId') vaultId: string,
  ): Promise<ObjectResponse<Vault | null>> {
    const vault = await this.vaultService.getVaultById(vaultId);
    return new ObjectResponse(
      vault,
      vault ? 'Vault found' : 'Vault not found',
      vault ? 200 : 404,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all vaults with pagination' })
  @ApiQuery({
    name: 'skip',
    type: 'number',
    required: false,
    description: 'Number of records to skip',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
    description: 'Number of records to return',
  })
  @ApiResponse({
    status: 200,
    description: 'Vaults found',
    type: ObjectResponse,
  })
  async getAllVaults(
    @Query('skip') skip: number = 0,
    @Query('limit') limit: number = 10,
  ): Promise<ObjectResponse<{ results: Vault[]; total: number }>> {
    const { vaults, total } = await this.vaultService.getAllVaults(skip, limit);
    return new ObjectResponse(
      { results: vaults, total },
      'Vaults retrieved successfully',
    );
  }

  @Get('battle/:battle_id')
  @ApiOperation({ summary: 'Get vaults by battle ID' })
  @ApiParam({
    name: 'battle_id',
    type: 'number',
    description: 'ID of the battle',
  })
  @ApiResponse({
    status: 200,
    description: 'Vaults found for battle',
    type: ObjectResponse,
  })
  async getVaultsByBattleId(
    @Param('battle_id') battle_id: number,
  ): Promise<ObjectResponse<Vault[]>> {
    const vaults = await this.vaultService.getVaultsByBattleId(battle_id);
    return new ObjectResponse(vaults, 'Vaults retrieved successfully');
  }

  @Get(':vault_id/performance')
  @ApiOperation({ summary: 'Get vault performance data' })
  @ApiParam({
    name: 'vault_id',
    type: 'string',
    description: 'ID of the vault',
  })
  @ApiQuery({
    name: 'period',
    type: 'string',
    required: false,
    description: 'Performance period (14D, 30D)',
  })
  @ApiResponse({
    status: 200,
    description: 'Vault performance data',
    type: ObjectResponse,
  })
  async getVaultPerformance(
    @Param('vault_id') vault_id: string,
    @Query('period') period: string = '14D',
  ): Promise<ObjectResponse<any>> {
    const performance = await this.vaultService.getVaultPerformance(
      vault_id,
      period,
    );
    return new ObjectResponse(
      performance,
      'Performance data retrieved successfully',
    );
  }

  @Put(':vault_id/performance')
  @ApiOperation({ summary: 'Update vault performance' })
  @ApiParam({
    name: 'vault_id',
    type: 'string',
    description: 'ID of the vault',
  })
  @ApiBody({
    description:
      'Performance update data (Note: Performance fields have been removed from the model)',
    schema: {
      type: 'object',
      properties: {
        // This endpoint should be removed as performance fields
        // have been removed from the vault model
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Performance updated successfully',
    type: ObjectResponse,
  })
  async updateVaultPerformance(
    @Param('vault_id') vault_id: string,
    @Body() performanceData: any,
  ): Promise<ObjectResponse<Vault>> {
    const vault = await this.vaultService.updateVaultPerformance(
      vault_id,
      performanceData,
    );
    return new ObjectResponse(vault, 'Performance updated successfully');
  }

  @Get(':vault_id/analytics')
  @ApiOperation({ summary: 'Get vault analytics by date range' })
  @ApiParam({
    name: 'vault_id',
    type: 'string',
    description: 'ID of the vault',
  })
  @ApiQuery({
    name: 'startDate',
    type: 'string',
    required: true,
    description: 'Start date in YYYY-MM-DD format',
  })
  @ApiQuery({
    name: 'endDate',
    type: 'string',
    required: true,
    description: 'End date in YYYY-MM-DD format',
  })
  @ApiResponse({
    status: 200,
    description: 'Vault analytics data',
    type: ObjectResponse,
  })
  async getVaultAnalyticsByDateRange(
    @Param('vault_id') vault_id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<ObjectResponse<VaultAnalytic[]>> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format. Please use YYYY-MM-DD format.');
    }

    const analytics = await this.vaultService.getVaultAnalyticsByDateRange(
      vault_id,
      start,
      end,
    );

    return new ObjectResponse(
      analytics,
      'Vault analytics retrieved successfully',
    );
  }
}
