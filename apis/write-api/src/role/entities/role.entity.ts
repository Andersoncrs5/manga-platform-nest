import {BaseEntity} from "../../utils/BaseEntity";
import {Column, Entity, Index} from "typeorm";

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
}
