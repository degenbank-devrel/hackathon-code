import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
} from 'sequelize-typescript';

@Table({ tableName: 'managers', timestamps: false })
export class Manager extends Model<Manager> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    field: 'manager_id',
  })
  manager_id: string;

  @Column({ type: DataType.STRING, allowNull: false, field: 'manager_name' })
  manager_name: string;

  @Column({ type: DataType.STRING, allowNull: false, field: 'wallet_address' })
  wallet_address: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'manager_token_address',
  })
  manager_token_address: string;

  @Column({ type: DataType.STRING, field: 'image' })
  image: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false, field: 'is_kyb' })
  is_kyb: boolean;
}
