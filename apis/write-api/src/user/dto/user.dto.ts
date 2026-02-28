import {User} from "../entities/user.entity";

export class UserDto {
    id!: string;
    name: string;
    username: string;
    email: string;
    isActive: boolean
    avatarUrl: string | null
    version!: number;
    loginBlockAt: Date | null
    roles: string[] = []
    createdAt!: Date;
    updatedAt: Date | undefined;

    static parseToDto(user: User): UserDto {
        const dto = new UserDto();

        dto.id = user.id;
        dto.name = user.name;
        dto.username = user.username;
        dto.email = user.email;
        dto.isActive = user.isActive;
        dto.avatarUrl = user.avatarUrl;
        dto.version = user.version;
        dto.loginBlockAt = user.loginBlockAt;
        dto.createdAt = user.createdAt;
        dto.updatedAt = user.updatedAt;

        return dto;
    }
}