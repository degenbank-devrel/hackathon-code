import { Controller, Get, Param, Post } from '@nestjs/common';
import { CommentService } from './comment.service';
import { ObjectResponse } from 'src/dto/response.dto';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('analyze')
  async analyzeVault() {
    const result = await this.commentService.analyzeVault();

    return new ObjectResponse(result, 'OK');
  }

  @Get('battle/:battleId/comments')
  @ApiOperation({ summary: 'Get comments by battle ID' })
  @ApiParam({
    name: 'battleId',
    type: 'number',
    description: 'ID of the battle',
  })
  @ApiResponse({
    status: 200,
    description: 'Comments found for battle',
    type: ObjectResponse,
  })
  async getCommentsByBattleId(@Param('battleId') battleId: number) {
    const comments = await this.commentService.getCommentsByBattleId(battleId);
    return new ObjectResponse(comments, 'Comments retrieved successfully');
  }
}
