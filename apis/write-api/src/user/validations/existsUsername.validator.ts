import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";
import {Injectable} from "@nestjs/common";
import {UserRepository} from "../user.repository";

@ValidatorConstraint({ name: 'existsUsername', async: true })
@Injectable()
export class ExistsUsernameValidator implements ValidatorConstraintInterface{
    constructor(private readonly userRepository: UserRepository) {}

    async validate(username: string): Promise<boolean>  {
        if (!username) return true;

        return await this.userRepository.existsByUsername(username);
    }

    defaultMessage(args: ValidationArguments) {
        return 'Username already exists';
    }

}

export function IsExistsUsername(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: ExistsUsernameValidator,
        });
    };
}