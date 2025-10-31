import {
  Table,
  PrimaryKey,
  AutoIncrement,
  Column,
  DataType,
  Model,
  BelongsTo,
} from 'sequelize-typescript';
import { Token } from './token.model';

@Table({
  tableName: 'vault_balances',
  timestamps: false,
})
export class VaultBalance extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    field: 'vault_balance_id',
  })
  vault_balance_id: number;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'vault_id',
  })
  vault_id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'token_id',
  })
  token_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'mint_address',
  })
  mint_address: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'token_address',
  })
  token_address: string;

  @Column({
    type: DataType.DECIMAL(20, 8),
    allowNull: false,
    defaultValue: 0,
  })
  balance: number;

  @BelongsTo(() => Token, 'token_id')
  token: Token;
}
