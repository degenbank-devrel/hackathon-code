import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Manager } from './manager.model';
import { Battle } from './battle.model';

@Table({ tableName: 'vaults', timestamps: false })
export class Vault extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    field: 'vault_id',
  })
  vault_id: string;

  @Column({ type: DataType.STRING, allowNull: false, field: 'vault_type' })
  vault_type: string;

  @Column({ type: DataType.STRING, allowNull: false, field: 'vault_name' })
  vault_name: string;

  @Column({ type: DataType.STRING, field: 'vault_image' })
  vault_image: string;

  @Column({ type: DataType.STRING, allowNull: false, field: 'vault_address' })
  vault_address: string;

  @Column({ type: DataType.STRING, field: 'token_program' })
  token_program: string;

  @Column({ type: DataType.STRING, field: 'token_address' })
  token_address: string;

  @Column({ type: DataType.STRING, field: 'vault_token_address' })
  vault_token_address: string;

  @Column({ type: DataType.STRING, field: 'vault_token_mint' })
  vault_token_mint: string;

  @Column({ type: DataType.DATE, field: 'locked_start' })
  locked_start: Date;

  @Column({ type: DataType.DATE, field: 'locked_end' })
  locked_end: Date;

  @Column({ type: DataType.STRING, field: 'vault_strategy' })
  vault_strategy: string;

  @Column({ type: DataType.STRING, field: 'vault_risks' })
  vault_risks: string;

  @Column({ type: DataType.TEXT, field: 'description' })
  description: string;

  @ForeignKey(() => Manager)
  @Column({ type: DataType.UUID, allowNull: false, field: 'manager_id' })
  manager_id: string;

  @BelongsTo(() => Manager)
  manager: Manager;

  @ForeignKey(() => Battle)
  @Column({ type: DataType.INTEGER, allowNull: true, field: 'battle_id' })
  battle_id: number;

  @BelongsTo(() => Battle)
  battle: Battle;

  @Column({
    type: DataType.ENUM('active', 'disqualified', 'winner', 'completed'),
    defaultValue: 'active',
    field: 'battle_status',
  })
  battle_status: string;

  @Column({ type: DataType.DATE, field: 'last_performance_update' })
  last_performance_update: Date;

  @Column({ type: DataType.STRING, field: 'risk_level' })
  risk_level: string;

  @Column({ type: DataType.DECIMAL(5, 2), defaultValue: 0, field: 'apy' })
  apy: number;

  @Column({ type: DataType.BIGINT, defaultValue: 0, field: 'tvl' })
  tvl: number;

  @Column({ type: DataType.STRING, field: 'deposit_asset' })
  deposit_asset: string;

  @Column({ type: DataType.STRING, field: 'target_asset' })
  target_asset: string;

  @Column({ type: DataType.BIGINT, defaultValue: 0, field: 'min_deposit' })
  min_deposit: number;

  @Column({ type: DataType.BIGINT, defaultValue: 0, field: 'total_stakers' })
  total_stakers: number;
}
