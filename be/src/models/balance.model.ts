import {
  Table,
  PrimaryKey,
  Column,
  DataType,
  Model,
  BelongsTo,
} from 'sequelize-typescript';
import { Vault } from './vault.model';
import { User } from './user.model';

@Table({
  tableName: 'balances',
  timestamps: false,
})
export class Balance extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    field: 'balance_id',
  })
  balance_id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  user_id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'vault_id',
  })
  vault_id: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  balance: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'last_updated',
  })
  last_updated: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'last_withdrawal',
  })
  last_withdrawal: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'last_deposit',
  })
  last_deposit: Date;

  @BelongsTo(() => Vault, 'vault_id')
  vault: Vault;

  @BelongsTo(() => User, 'user_id')
  user: User;
}
