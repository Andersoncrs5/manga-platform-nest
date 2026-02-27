import {BaseEntity} from "../../utils/BaseEntity";
import {Column, Entity, Index, OneToMany} from "typeorm";
import {UserRole} from "../../user-role/entities/user-role.entity";

@Entity('roles')
@Index('idx_role_name', ['name'])
export class Role extends BaseEntity {
    @Column({
        type: 'varchar',
        length: 100,
        nullable: false,
        unique: true,
        name: 'name'
    })
    name: string;

    @Column({
        type: 'varchar',
        length: 200,
        nullable: true,
        name: 'description'
    })
    description: string;

    @Column({
        name: "active",
        nullable: false,
    })
    isActive: boolean = true;

    @OneToMany(() => UserRole, (userRole) => userRole.role)
    userRoles: UserRole[];
}
