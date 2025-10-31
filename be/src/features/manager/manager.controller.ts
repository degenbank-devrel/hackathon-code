import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ManagerService } from './manager.service';
import { ObjectResponse } from 'src/dto/response.dto';
import { Manager } from 'src/models/manager.model';

@ApiTags('Manager')
@Controller('manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Get(':manager_id')
  @ApiOperation({ summary: 'Get manager by ID' })
  @ApiParam({
    name: 'manager_id',
    type: 'number',
    description: 'ID of the manager',
  })
  @ApiResponse({
    status: 200,
    description: 'Manager found',
    type: ObjectResponse,
  })
  @ApiResponse({ status: 404, description: 'Manager not found' })
  async getManagerById(
    @Param('manager_id') manager_id: string,
  ): Promise<ObjectResponse<Manager | null>> {
    const manager = await this.managerService.getManagerById(manager_id);
    return new ObjectResponse(
      manager,
      manager ? 'Manager found' : 'Manager not found',
      manager ? 200 : 404,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all managers with pagination' })
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
    description: 'Managers found',
    type: ObjectResponse,
  })
  async getAllManagers(
    @Query('skip') skip: number = 0,
    @Query('limit') limit: number = 10,
  ): Promise<ObjectResponse<{ results: Manager[]; total: number }>> {
    const { managers, total } = await this.managerService.getAllManagers(
      skip,
      limit,
    );
    return new ObjectResponse(
      { results: managers, total },
      'Managers retrieved successfully',
    );
  }
}
