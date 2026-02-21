import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
import sanitizeHtml from "sanitize-html";
import {IsUniqueEmail} from "../validations/uniqueEmail.validator";
import {IsUniqueUsername} from "../validations/uniqueUsername.validator";

export class CreateUserDto {
    @IsString({ message: "The field name should be a string" })
    @IsNotEmpty({ message: "The field name cannot be null" })
    @Length(1, 100, { message: "The max length of name is 100 and min is 1" })
    @Transform(({ value }) => sanitizeHtml(value))
    @ApiProperty({ default: "user" })
    name: string;

    @IsString({ message: "The field name should be a string" })
    @IsNotEmpty({ message: "The field name cannot be null" })
    @Length(1, 100, { message: "The max length of name is 100 and min is 1" })
    @Transform(({ value }) => sanitizeHtml(value))
    @ApiProperty({ default: "user" })
    @IsUniqueUsername({ message: 'Username already exists' })
    username: string;

    @IsString({ message: "The field email should be a string" })
    @IsNotEmpty({ message: "The field email cannot be null" })
    @Length(1, 150, { message: "The max length of email is 150 and min is 1" })
    @IsEmail({}, { message: "The field email must be a valid email address" })
    @Transform(({ value }) => value.trim() )
    @Transform(({ value }) => value.toLowerCase() )
    @Transform(({ value }) => sanitizeHtml(value))
    @ApiProperty({ default: "user@example.com" })
    @IsUniqueEmail({ message: 'Email already exists' })
    email: string;

    @IsString({ message: "The field password should be a string" })
    @IsNotEmpty({ message: "The field password cannot be null" })
    @Length(6, 50, { message: "The max length of password is 50 and min is 6" })
    @Transform(({ value }) => value.trim() )
    @Transform(({ value }) => value.toLowerCase() )
    @Transform(({ value }) => sanitizeHtml(value))
    @ApiProperty({ default: "12345678" })
    password: string
}
