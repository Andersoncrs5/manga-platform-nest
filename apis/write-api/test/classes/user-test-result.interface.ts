import {LoginResponse} from "../../src/auth/class/login.response";
import {CreateUserDto} from "../../src/user/dto/create-user.dto";
import {UserDto} from "../../src/user/dto/user.dto";

export interface UserTestResult {
    login: LoginResponse;
    dto: CreateUserDto
    user: UserDto
}