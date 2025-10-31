import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Vault } from './vault.model';

@Table({ tableName: 'user_vault_positions', timestamps: false })
export class UserVaultPosition extends Model<UserVaultPosition> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  position_id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  user_id: string;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Vault)
  @Column({ type: DataType.UUID, allowNull: false })
  vault_id: string;

  @BelongsTo(() => Vault)
  vault: Vault;

  // Position data
  @Column({ type: DataType.DECIMAL(20, 8), defaultValue: 0 })
  vault_shares: number;

  @Column({ type: DataType.DECIMAL(20, 8), defaultValue: 0 })
  cumulative_deposits: number;

  @Column({ type: DataType.DECIMAL(20, 8), defaultValue: 0 })
  cumulative_withdrawals: number;

  @Column({ type: DataType.DECIMAL(20, 8), defaultValue: 0 })
  current_value: number;

  @Column({ type: DataType.DECIMAL(20, 8), defaultValue: 0 })
  high_water_mark: number;

  @Column({ type: DataType.DECIMAL(20, 8), defaultValue: 0 })
  fees_paid: number;

  @Column({ type: DataType.DECIMAL(10, 4), defaultValue: 0 })
  max_daily_drawdown: number;

  @Column({ type: DataType.DECIMAL(10, 4), defaultValue: 0 })
  total_return_percentage: number;

  @Column({ type: DataType.STRING, allowNull: true })
  tx_hash: string;

  // Timestamps
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  first_deposit_at: Date;

  @Column({ type: DataType.DATE })
  last_transaction_at: Date;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  created_at: Date;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  updated_at: Date;
}
