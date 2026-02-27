import {Entity, ManyToOne, JoinColumn, Column, Index} from "typeorm";
import { BaseEntity } from "../../utils/BaseEntity";
import {User} from "../../user/entities/user.entity";
import {Role} from "../../role/entities/role.entity";

@Entity('userRoles')
@Index('idx_user_role_unique', ['userId', 'roleId'], { unique: true })
export class UserRole extends BaseEntity {
    @Column()
    userId: string;

    @Column()
    roleId: string;

    @ManyToOne(() => User, (user) => user.userRoles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Role, (role) => role.userRoles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'roleId' })
    role: Role;
}