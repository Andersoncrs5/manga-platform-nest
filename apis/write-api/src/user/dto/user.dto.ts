export class UserDto {
    id!: string;
    name: string;
    username: string;
    email: string;
    isActive: boolean
    avatarUrl: string | null
    version!: number;
    loginBlockAt: Date | null
    createdAt!: Date;
    updatedAt: Date | undefined;
}