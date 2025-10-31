import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { HttpModule } from '@nestjs/axios';
import { SequelizeModule } from '@nestjs/sequelize';
import { Vault } from 'src/models/vault.model';
import { VaultAnalytic } from 'src/models/vaultanalytics.model';
import { Comment } from 'src/models/comment.model';
import { Battle } from 'src/models/battle.model';

@Module({
  imports: [
    HttpModule,
    SequelizeModule.forFeature([Vault, VaultAnalytic, Comment, Battle]),
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
