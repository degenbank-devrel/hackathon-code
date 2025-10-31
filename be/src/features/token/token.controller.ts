import { Controller, Get, Param, Query } from '@nestjs/common';
import { TokenService } from './token.service';
import { ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ObjectResponse } from 'src/dto/response.dto';
@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}
  @Get(':token_id')
  @ApiOperation({ summary: 'Get token by Token id' })
  @ApiParam({
    name: 'token_id',
    type: 'string',
    description: 'Token Id',
  })
  async getTokenById(@Param('token_id') tokenId: string) {
    const result = await this.tokenService.getTokenById(tokenId);
    return new ObjectResponse(result, 'success');
  }

  @Get('/address/:address')
  @ApiOperation({ summary: 'Get token by Token Address' })
  @ApiParam({
    name: 'address',
    type: 'string',
    description: 'Token address',
  })
  async getTokenByAddress(@Param('address') tokenAddress: string) {
    const result = await this.tokenService.getTokenByAddress(tokenAddress);
    return new ObjectResponse(result, 'success');
  }

  @Get('/network/:network')
  @ApiOperation({ summary: 'Get all token by Network' })
  @ApiParam({
    name: 'network',
    type: 'string',
    description: 'Network',
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
  async getTokenByNetwork(
    @Param('network') network: string,
    @Query('skip') skip: string,
    @Query('limit') limit: string,
  ) {
    const skipInt = skip ? parseInt(skip, 0) : 0;
    const limitInt = limit ? parseInt(limit, 10) : 10;
    const result = await this.tokenService.getTokens(
      network,
      skipInt,
      limitInt,
    );
    return new ObjectResponse(result, 'success');
  }
}
