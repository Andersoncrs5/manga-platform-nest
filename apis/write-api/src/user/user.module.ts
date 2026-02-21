import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import {UserRepository} from "./user.repository";
import {User} from "./entities/user.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UniqueEmailValidator} from "./validations/uniqueEmail.validator";
import {CryptoService} from "../utils/service/crypto/CryptoService";
import { UniqueUsernameValidator } from './validations/uniqueUsername.validator';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
      UserService,
      UserRepository,
      UniqueEmailValidator,
      UniqueUsernameValidator,
      CryptoService
  ],
})
export class UserModule {}
