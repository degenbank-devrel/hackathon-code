import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Manager } from 'src/models/manager.model';
import { ManagerService } from './manager.service';
import { ManagerController } from './manager.controller';

@Module({
  imports: [SequelizeModule.forFeature([Manager])],
  providers: [ManagerService],
  controllers: [ManagerController],
})
export class ManagerModule {}
