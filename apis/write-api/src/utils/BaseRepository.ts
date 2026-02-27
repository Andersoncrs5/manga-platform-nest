import {DeepPartial, DeleteResult, FindOptionsWhere, QueryDeepPartialEntity, Repository} from "typeorm";
import {BaseEntity} from "./BaseEntity";

export abstract class BaseRepository<T extends BaseEntity> {
    protected constructor(protected readonly repository: Repository<T>) {}

    async findById(id: string): Promise<T | null> {
        return await this.repository.findOne({
            where: { id } as FindOptionsWhere<T>
        });
    }

    async existsById(id: string): Promise<boolean> {
        return await this.repository.exists({
            where: { id } as FindOptionsWhere<T>
        });
    }

    async save(data: DeepPartial<T>): Promise<T> {
        return await this.repository.save(data);
    }

    async delete(id: string): Promise<DeleteResult> {
        return await this.repository.delete(id);
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

    async saveMany(data: DeepPartial<T>[]): Promise<T[]> {
        return await this.repository.save(data);
    }

    async update(id: string, data: QueryDeepPartialEntity<T>): Promise<void> {
        await this.repository.update(id, data);
    }

    getBuilder(alias: string) {
        return this.repository.createQueryBuilder(alias);
    }
}