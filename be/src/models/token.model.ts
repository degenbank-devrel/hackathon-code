import {
  Table,
  PrimaryKey,
  Column,
  DataType,
  Model,
} from 'sequelize-typescript';

@Table({
  tableName: 'tokens',
  timestamps: false,
})
export class Token extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    field: 'token_id',
  })
  token_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'token_name',
  })
  token_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'token_address',
  })
  token_address: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'token_mint',
  })
  token_mint: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'token_program',
  })
  token_program: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  network: string;
}
