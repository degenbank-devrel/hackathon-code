import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Battle } from './battle.model';

@Table({
  tableName: 'comments',
  timestamps: false,
})
export class Comment extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'comment_id',
  })
  comment_id: number;

  @ForeignKey(() => Battle)
  @Column({
    type: DataType.INTEGER,
    field: 'battle_id',
  })
  battle_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  commentator: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  comment: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: DataType.NOW,
    field: 'comment_at',
  })
  comment_at: Date;

  @BelongsTo(() => Battle)
  battle: Battle;
}
