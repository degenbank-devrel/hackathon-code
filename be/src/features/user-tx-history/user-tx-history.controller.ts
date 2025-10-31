import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserTxHistoryService } from './user-tx-history.service';
import { ObjectResponse } from 'src/dto/response.dto';
import { UserTxHistory } from 'src/models/usertxhistory.model';

@ApiTags('User Transaction History')
@Controller('user-tx-history')
export class UserTxHistoryController {
  constructor(private readonly userTxHistoryService: UserTxHistoryService) {}

  @Get('user/:user_id')
  @ApiOperation({
    summary: 'Get transaction history for a specific user with pagination',
  })
  @ApiParam({
    name: 'user_id',
    type: 'string',
    description: 'UUID of the user',
  })
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
    description: 'User transaction history retrieved successfully',
    type: ObjectResponse,
  })
  async getUserTxHistory(
    @Param('user_id') user_id: string,
    @Query('skip') skip: number = 0,
    @Query('limit') limit: number = 10,
  ): Promise<ObjectResponse<{ results: UserTxHistory[]; total: number }>> {
    const { histories, total } =
      await this.userTxHistoryService.getUserTxHistory(user_id, skip, limit);
    return new ObjectResponse(
      { results: histories, total },
      'User transaction history retrieved successfully',
    );
  }

  @Get(':tx_id')
  @ApiOperation({ summary: 'Get transaction history by transaction ID' })
  @ApiParam({
    name: 'tx_id',
    type: 'string',
    description: 'Transaction ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction history found',
    type: ObjectResponse,
  })
  @ApiResponse({ status: 404, description: 'Transaction history not found' })
  async getTxHistoryById(
    @Param('tx_id') tx_id: string,
  ): Promise<ObjectResponse<UserTxHistory | null>> {
    const history = await this.userTxHistoryService.getTxHistoryById(tx_id);
    return new ObjectResponse(
      history,
      history ? 'Transaction history found' : 'Transaction history not found',
      history ? 200 : 404,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all transaction history with pagination' })
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
    description: 'Transaction history retrieved successfully',
    type: ObjectResponse,
  })
  async getAllTxHistory(
    @Query('skip') skip: number = 0,
    @Query('limit') limit: number = 10,
  ): Promise<ObjectResponse<{ results: UserTxHistory[]; total: number }>> {
    const { histories, total } =
      await this.userTxHistoryService.getAllTxHistory(skip, limit);
    return new ObjectResponse(
      { results: histories, total },
      'Transaction history retrieved successfully',
    );
  }
}
