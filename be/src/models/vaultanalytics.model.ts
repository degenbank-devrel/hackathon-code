import {
  Table,
  PrimaryKey,
  AutoIncrement,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { Vault } from './vault.model';

@Table({ tableName: 'vault_analytics', timestamps: false })
export class VaultAnalytic extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, field: 'va_id' })
  va_id: number;

  @Column({ type: DataType.DATE, allowNull: false, field: 'va_date' })
  va_date: Date;

  @ForeignKey(() => Vault)
  @Column({ type: DataType.UUID, allowNull: false, field: 'vault_id' })
  vault_id: string;

  @Column({
    type: DataType.FLOAT(8),
    allowNull: false,
    field: 'total_deposit',
  })
  total_deposit: number;

  @Column({
    type: DataType.FLOAT(8),
    allowNull: false,
    field: 'share_price',
  })
  share_price: number;

  @Column({
    type: DataType.FLOAT(8),
    allowNull: false,
    field: 'total_roi',
  })
  total_roi: number;

  @BelongsTo(() => Vault)
  vault: Vault;
}
