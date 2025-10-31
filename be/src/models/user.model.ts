import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
} from 'sequelize-typescript';

@Table({
  tableName: 'users',
  timestamps: false,
})
export class User extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    field: 'user_id',
  })
  user_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'fullname',
  })
  fullname: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    field: 'privy_id',
  })
  privy_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    field: 'wallet_address',
    comment: 'Solana wallet address',
  })
  wallet_address: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  image: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'join_date',
  })
  join_date: Date;
}
