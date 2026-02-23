import {Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {UserDto} from "./dto/user.dto";
import {Transactional} from "typeorm-transactional";

  @Controller('v1/user')
  export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    @Transactional()
    async create(@Body() createUserDto: CreateUserDto) {
      const userCreated = await this.userService.create(createUserDto);

      const userDto: UserDto = { ...userCreated };

      return userDto;
    }

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
