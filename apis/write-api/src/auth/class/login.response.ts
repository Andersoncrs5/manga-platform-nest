import {Tokens} from "./tokens.class";
import {UserDto} from "../../user/dto/user.dto";

export class LoginResponse {
    tokens: Tokens
    user: UserDto;
    roles: string[];
}