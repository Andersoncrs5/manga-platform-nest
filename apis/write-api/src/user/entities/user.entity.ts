import { BaseEntity } from "../../utils/BaseEntity";
import {Column, Entity, Index, OneToMany} from "typeorm";
import {UserRole} from "../../user-role/entities/user-role.entity";
import {UserDto} from "../dto/user.dto";

@Entity('users')
export class User extends BaseEntity {
    @Column({ type: 'varchar', length: 100, nullable: false })
    name: string;

    @Index('idx_username', { unique: true })
    @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
    username: string;

    @Index('idx_email', { unique: true })
    @Column({ type: 'varchar', length: 150, unique: true, nullable: false })
    email: string;

    @Column({ type: 'varchar', length: 300, nullable: false })
    password: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'boolean', default: false })
    isVerified: boolean;

    @Column({ type: 'varchar', length: 50, nullable: true })
    registrationIp: string | null;

    @Column({ type: 'varchar', length: 600, nullable: true })
    avatarUrl: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    refreshToken: string | null;

    @Column({ type: 'timestamp', nullable: true })
    loginBlockAt: Date | null;

    @Column({ type: 'smallint', default: 0 })
    attemptsLoginFailed: number;

    @OneToMany(() => UserRole, (userRole) => userRole.user)
    userRoles: UserRole[];

    toDto(): UserDto {
        const dto = new UserDto();

        dto.id = this.id;
        dto.name = this.name;
        dto.username = this.username;
        dto.email = this.email;
        dto.isActive = this.isActive;
        dto.avatarUrl = this.avatarUrl;
        dto.version = this.version;
        dto.loginBlockAt = this.loginBlockAt;
        dto.createdAt = this.createdAt;
        dto.updatedAt = this.updatedAt;

        if (this.userRoles) {
            dto.roles = this.userRoles
                .filter(ur => ur.role)
                .map(ur => ur.role.name);
        } else {
            dto.roles = [];
        }

        return dto;
    }
}