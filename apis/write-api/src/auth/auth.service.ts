import { Injectable } from '@nestjs/common';
import {CreateUserDto} from "../user/dto/create-user.dto";
import {UserService} from "../user/user.service";
import {JwtService} from "@nestjs/jwt";
import {User} from "../user/entities/user.entity";
import {RoleService} from "../role/role.service";
import {UserRoleService} from "../user-role/user-role.service";
import {Role} from "../role/entities/role.entity";
import {Payload} from "./class/payload.interface";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
      private readonly userService: UserService,
      private readonly userRoleService: UserRoleService,
      private readonly roleService: RoleService,
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService
  ) {}

  async create(dto: CreateUserDto) {
    const userCreated: User = await this.userService.create(dto);
    const role: Role = await this.roleService.findByNameSimple("USER_ROLE");
    await this.userRoleService.create(userCreated.id, role.id)

    const token: string = this.createToken(userCreated, [role]);
    const refreshToken: string = this.createRefreshToken(userCreated);

    return {
      token: token,
      refreshToken: refreshToken,
    }
  }

  public createToken(user: User, roles: Role[]): string {
    const payload: Payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roles: roles.map(role => role.name)
    }

    return this.jwtService.sign(payload)
  }

  public createRefreshToken(user: User): string {
    const payload = { sub: user.id, email: user.email };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRES_IN'),
    });
  }

}
