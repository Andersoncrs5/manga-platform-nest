
export class RoleDto {
    id!: string;
    name: string;
    description: string;
    isActive: boolean = true;
    version!: number;
    createdAt!: Date;
    updatedAt: Date | undefined;
}