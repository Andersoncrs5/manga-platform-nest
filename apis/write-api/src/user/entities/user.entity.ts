import { BaseEntity } from "../../utils/BaseEntity";
import { Column, Entity, Index } from "typeorm";

@Entity('users')
@Index('idx_username', ['username'])
@Index('idx_email', ['email'])
export class User extends BaseEntity {
    @Column({ type: 'varchar', length: 100, nullable: false })
    name: string;

    @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
    username: string;

    @Column({ type: 'varchar', length: 150, unique: true, nullable: false })
    email: string;

    @Column({ type: 'varchar', length: 300, nullable: false, select: false })
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
}