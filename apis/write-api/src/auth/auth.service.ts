import {Injectable, UnauthorizedException} from '@nestjs/common';
import {CreateUserDto} from "../user/dto/create-user.dto";
import {UserService} from "../user/user.service";
import {JwtService} from "@nestjs/jwt";
import {User} from "../user/entities/user.entity";
import {RoleService} from "../role/role.service";
import {UserRoleService} from "../user-role/user-role.service";
import {Role} from "../role/entities/role.entity";
import {Payload} from "./class/payload.interface";
import {ConfigService} from "@nestjs/config";
import {Tokens} from "./class/tokens.class";
import {CryptoService} from "../utils/service/crypto/CryptoService";
import {LoginUserDto} from "./dto/login-user.dto";
import {UserRole} from "../user-role/entities/user-role.entity";
import {UserDto} from "../user/dto/user.dto";
import {LoginResponse} from "./class/login.response";

@Injectable()
export class AuthService {
  constructor(
      private readonly userService: UserService,
      private readonly userRoleService: UserRoleService,
      private readonly roleService: RoleService,
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService,
      private readonly cryptoService: CryptoService
  ) {}

  async create(dto: CreateUserDto) {
    const userCreated: User = await this.userService.create(dto);
    const role: Role = await this.roleService.findByNameSimple("USER_ROLE");
    await this.userRoleService.create(userCreated.id, role.id)
    return await this.createTokens(userCreated, [role.name]);
  }

  async login(dto: LoginUserDto) {
    const user = await this.userService.findOneByEmail(dto.email);
    if (user == null) throw new UnauthorizedException();

    const result = await this.cryptoService.verifyPassword(dto.password, user.password);
    if (result == null) throw new UnauthorizedException();

    const userRoles: UserRole[] = await this.userRoleService.findAllByUserId(user.id);

    const roles: string[] = userRoles.map(x => x.role.name);

    return await this.createTokens(user, roles);
  }

  public createToken(user: User, roles: string[]): string {
    const payload: Payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roles: roles
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

  private async createTokens(userCreated: User, roles: string[]) {
    const token: string = this.createToken(userCreated, roles);
    const refreshToken: string = this.createRefreshToken(userCreated);

    const userUpdated: User = await this.userService.updateRefreshToken(userCreated, refreshToken);

    const tokens: Tokens = {
      token,
      refreshToken
    }

    const loginResponse: LoginResponse = {
      user: UserDto.parseToDto(userUpdated),
      tokens: tokens,
      roles
    }

    return loginResponse
  }

}
