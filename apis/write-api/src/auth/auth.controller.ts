import {Body, Controller, HttpCode, HttpStatus, Patch, Post, UnauthorizedException, UseGuards} from '@nestjs/common';
import {AuthService} from './auth.service';
import {CreateUserDto} from "../user/dto/create-user.dto";
import {LoginResponse} from "./class/login.response";
import {LoginUserDto} from "./dto/login-user.dto";
import {ApiExtraModels} from "@nestjs/swagger";
import {ResponseHTTP} from "../utils/res/responseHttp.res";
import {UserService} from "../user/user.service";
import {JwtGuard} from "./guards/auth-guard.guard";
import {Payload} from "./class/payload.interface";
import {CurrentUser} from "./decorators/current-user";

@Controller('v1/auth')
export class AuthController {
  constructor(
      private readonly authService: AuthService,
      private readonly userService: UserService,
    ) {}

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiExtraModels(ResponseHTTP, LoginResponse)
  async createUser(@Body() dto: CreateUserDto): Promise<LoginResponse> {
    return await this.authService.create(dto);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiExtraModels(ResponseHTTP, LoginResponse)
  async login(@Body() dto: LoginUserDto): Promise<LoginResponse> {
    return await this.authService.login(dto);
  }

  @Patch('/logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  async logout(
      @CurrentUser() payload: Payload,
  ) {
    const user = await this.userService.findOneById(payload.sub);
    if (!user) throw new UnauthorizedException();
    await this.authService.logout(user);
  }

}
