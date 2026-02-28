import {Body, Controller, Param, Patch} from '@nestjs/common';
import { RoleService } from './role.service';
import {UpdateRoleDto} from "./dto/update-role.dto";
import {Role} from "./entities/role.entity";
import {RoleDto} from "./dto/role.dto";

@Controller('role')
export class RoleController {
  constructor(private readonly service: RoleService) {}

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    const role: Role = await this.service.findByIdSimple(id);
    const roleUpdated: Role = await this.service.update(role, dto);

    const roleDto: RoleDto = { ...roleUpdated }

    return roleDto;
  }

}
