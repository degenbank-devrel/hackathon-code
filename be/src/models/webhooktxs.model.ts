import {
  Table,
  PrimaryKey,
  Column,
  DataType,
  Model,
} from 'sequelize-typescript';

@Table({
  tableName: 'webhooktxs',
  timestamps: false,
})
export class WebhookTx extends Model {
  @PrimaryKey
  @Column({
    field: 'tx_id',
  })
  tx_id: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  data: object;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  timestamp: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_processed',
  })
  is_processed: boolean;
}
