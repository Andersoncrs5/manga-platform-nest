import { Module } from '@nestjs/common';
import { UserRoleService } from './user-role.service';
import { UserRoleController } from './user-role.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserRole} from "./entities/user-role.entity";
import {UserRoleRepository} from "./user-role.repository";

@Module({
  imports: [
      TypeOrmModule.forFeature([UserRole]),
  ],
  controllers: [UserRoleController],
  providers: [
      UserRoleService,
      UserRoleRepository
  ],
  exports: [UserRoleService],
})
export class UserRoleModule {}
