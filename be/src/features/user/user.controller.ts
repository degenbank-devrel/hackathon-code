import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { ObjectResponse } from 'src/dto/response.dto';
import { User } from 'src/models/user.model';
import { CreateUserDto } from 'src/dto/user.dto';
import { PrivyGuard } from 'src/guards/privy.guard';
import type { UserRequest } from 'src/dto/request.dto';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':user_id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({
    name: 'user_id',
    type: 'string',
    description: 'UUID of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: ObjectResponse,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(
    @Param('user_id') user_id: string,
  ): Promise<ObjectResponse<User | null>> {
    const user = await this.userService.getUserById(user_id);
    return new ObjectResponse(
      user,
      user ? 'User found' : 'User not found',
      user ? 200 : 404,
    );
  }

  @Get('wallet/:wallet_address')
  @ApiOperation({ summary: 'Get user by wallet address' })
  @ApiParam({
    name: 'wallet_address',
    type: 'string',
    description: 'Solana wallet address of the user',
  })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: ObjectResponse,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserByWalletAddress(
    @Param('wallet_address') walletAddress: string,
  ): Promise<ObjectResponse<User | null>> {
    const user = await this.userService.getUserByWalletAddress(walletAddress);
    return new ObjectResponse(
      user,
      user ? 'User found' : 'User not found',
      user ? 200 : 404,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
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
    description: 'Users found',
    type: ObjectResponse,
  })
  async getAllUsers(
    @Query('skip') skip: number = 0,
    @Query('limit') limit: number = 10,
  ): Promise<ObjectResponse<{ results: User[]; total: number }>> {
    const { users, total } = await this.userService.getAllUsers(skip, limit);
    return new ObjectResponse(
      { results: users, total },
      'Users retrieved successfully',
    );
  }

  @Post()
  @UseGuards(PrivyGuard)
  @ApiOperation({
    summary: 'Create a new user or get existing user',
    description:
      'Email is optional - users can register with Solana wallet only',
  })
  @ApiBearerAuth()
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User found (existing user)',
    type: ObjectResponse,
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully (new user)',
    type: ObjectResponse,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 409,
    description: 'Email or wallet address already exists (if provided)',
  })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Req() req: UserRequest,
  ): Promise<ObjectResponse<User>> {
    const { user, isNewUser } = await this.userService.createOrGetUser(
      createUserDto,
      req.user?.user_id || '',
    );
    return new ObjectResponse(
      user,
      isNewUser ? 'User created successfully' : 'User found',
      isNewUser ? 201 : 200,
    );
  }
}
