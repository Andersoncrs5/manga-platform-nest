import {DeepPartial, FindOptionsWhere, Repository} from "typeorm";
import {BaseEntity} from "./BaseEntity";

export abstract class BaseRepository<T extends BaseEntity> {
    constructor(protected readonly repository: Repository<T>) {}

    async findById(id: any): Promise<T | null> {
        return await this.repository.findOne({
            where: { id } as FindOptionsWhere<T>
        });
    }

    async existsById(id: any): Promise<boolean> {
        return await this.repository.exists({
            where: { id } as FindOptionsWhere<T>
        });
    }

    async save(data: DeepPartial<T>): Promise<T> {
        return await this.repository.save(data);
    }

    async delete(id: any): Promise<void> {
        await this.repository.delete(id);
    }

    async findOneByOptions(options: FindOptionsWhere<T>): Promise<T | null> {
        return await this.repository.findOne({ where: options });
    }

    async existsByOptions(options: FindOptionsWhere<T>): Promise<boolean> {
        return await this.repository.exists({ where: options });
    }

    async clearTable(): Promise<void> {
        await this.repository.clear();
    }
}