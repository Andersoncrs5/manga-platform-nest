import {Controller, Body, Patch, Param, Delete} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {Transactional} from "typeorm-transactional";

@Controller('v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch(':id')
  @Transactional()
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const newVar = await this.userService.findOneByIdSimple(id);
    return this.userService.update(newVar, updateUserDto);
  }

  @Delete(':id')
  @Transactional()
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
