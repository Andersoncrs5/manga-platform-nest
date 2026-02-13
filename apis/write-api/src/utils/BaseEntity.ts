import 'reflect-metadata';
import {
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    VersionColumn
} from 'typeorm';

export abstract class BaseEntity {
    @PrimaryGeneratedColumn({ unsigned: true })
    id!: string;

    @VersionColumn()
    version!: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date | undefined;
}