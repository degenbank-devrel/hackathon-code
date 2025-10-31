import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BattleService } from './battle.service';
import { ObjectResponse } from 'src/dto/response.dto';
import { Battle } from 'src/models/battle.model';

@ApiTags('Battle')
@Controller('battle')
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Get(':battleId')
  @ApiOperation({ summary: 'Get battle by ID' })
  @ApiParam({
    name: 'battleId',
    type: 'number',
    description: 'ID of the battle',
  })
  @ApiResponse({
    status: 200,
    description: 'Battle found',
    type: ObjectResponse,
  })
  @ApiResponse({ status: 404, description: 'Battle not found' })
  async getBattleById(
    @Param('battleId') battleId: string,
  ): Promise<ObjectResponse<Battle | null>> {
    const battle = await this.battleService.getBattleById(battleId);
    return new ObjectResponse(
      battle,
      battle ? 'Battle found' : 'Battle not found',
      battle ? 200 : 404,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all battles with pagination' })
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
    description: 'Battles found',
    type: ObjectResponse,
  })
  async getAllBattles(
    @Query('skip') skip: number = 0,
    @Query('limit') limit: number = 10,
  ): Promise<ObjectResponse<{ results: Battle[]; total: number }>> {
    const { battles, total } = await this.battleService.getAllBattles(
      skip,
      limit,
    );
    return new ObjectResponse(
      { results: battles, total },
      'Battles retrieved successfully',
    );
  }
}
