import { Injectable } from '@nestjs/common';
import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { UserRepository } from '../../user/user.repository';

@ValidatorConstraint({ name: 'UniqueEmail', async: true })
@Injectable()
export class UniqueEmailValidator implements ValidatorConstraintInterface {
    constructor(private readonly userRepository: UserRepository) {}

    async validate(email: string): Promise<boolean> {
        if (!email) return false;

        const user = await this.userRepository.existsByEmail(email);
        return !user;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Email already exists';
    }
}

export function IsUniqueEmail(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: UniqueEmailValidator,
        });
    };
}