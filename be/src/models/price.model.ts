import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Token } from './token.model';

@Table({
  tableName: 'prices',
  timestamps: false,
})
export class Price extends Model {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    field: 'price_id',
  })
  price_id: number;

  @ForeignKey(() => Token)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'token_id',
  })
  token_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'price',
  })
  price: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'fetch_date',
  })
  fetch_date: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  network: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  currency: string;

  @BelongsTo(() => Token)
  token: Token;
}
