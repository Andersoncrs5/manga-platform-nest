import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {IsExistsUsername} from "../validations/existsUsername.validator";
import {IsNotEmpty, IsString, Length} from "class-validator";
import {Transform} from "class-transformer";
import sanitizeHtml from "sanitize-html";

export class UpdateUserDto  {
    name: string | null;
    username: string | null;
    password: string | null;
    avatarUrl: string | null;
}
