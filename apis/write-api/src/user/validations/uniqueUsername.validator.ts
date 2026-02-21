import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";
import {Injectable} from "@nestjs/common";
import {UserRepository} from "../user.repository";

@ValidatorConstraint({ name: 'uniqueUsername', async: true })
@Injectable()
export class UniqueUsernameValidator implements ValidatorConstraintInterface{
    constructor(private readonly userRepository: UserRepository) {}

    async validate(username: string): Promise<boolean>  {
        if (!username) return false;

        const result = await this.userRepository.existsByUsername(username);

        return !result;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Username already exists';
    }

}

export function IsUniqueUsername(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: UniqueUsernameValidator,
        });
    };
}