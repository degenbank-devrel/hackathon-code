import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Vault } from './vault.model';

@Table({
  tableName: 'battles',
  timestamps: false,
})
export class Battle extends Model<Battle> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'battle_id',
  })
  battle_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'battle_name',
  })
  battle_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'battle_image',
  })
  battle_image: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'battle_description',
  })
  battle_description: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'battle_start',
  })
  battle_start: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'battle_end',
  })
  battle_end: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'program_address',
  })
  program_address: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'treasury_address',
  })
  treasury_address: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'owner_address',
  })
  owner_address: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'pda_address',
  })
  pda_address: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_available',
  })
  is_available: boolean;

  @Column({
    type: DataType.ENUM(
      'DCA Strategy',
      'Lending Strategy',
      'Mixed Strategy',
      'Yield Farming',
    ),
    allowNull: false,
    defaultValue: 'DCA Strategy',
    field: 'arena_type',
  })
  arena_type: string;

  @Column({
    type: DataType.ENUM('stake_phase', 'battle_phase', 'completed'),
    allowNull: false,
    defaultValue: 'stake_phase',
    field: 'current_phase',
  })
  current_phase: string;

  @Column({
    type: DataType.ENUM('open_deposit', 'ongoing_battle', 'completed'),
    allowNull: false,
    defaultValue: 'open_deposit',
    field: 'status',
  })
  status: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    defaultValue: 0,
    field: 'prize_pool',
  })
  prize_pool: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'winner_vault_id',
  })
  winner_vault_id: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'arena_color',
  })
  arena_color: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_participants',
  })
  total_participants: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    defaultValue: 0,
    field: 'total_tvl',
  })
  total_tvl: number;

  @HasMany(() => Vault)
  vaults: Vault[];
}
