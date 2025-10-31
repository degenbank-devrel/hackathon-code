import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Vault } from './vault.model';

@Table({
  tableName: 'user_tx_history',
  timestamps: false,
})
export class UserTxHistory extends Model {
  @PrimaryKey
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'tx_id',
  })
  tx_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'vault_id',
  })
  vault_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'user_id',
  })
  user_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'tx_type',
  })
  tx_type: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  fee: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'transaction_date',
  })
  transactionDate: Date;

  @BelongsTo(() => Vault, 'vault_id')
  vault: Vault;

  @BelongsTo(() => User, 'user_id')
  user: User;
}
