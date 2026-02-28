import {Injectable} from "@nestjs/common";
import {BaseRepository} from "../utils/BaseRepository";
import {Role} from "./entities/role.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {InsertResult, Repository} from "typeorm";

@Injectable()
export class RoleRepository extends BaseRepository<Role> {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) {
        super(roleRepository);
    }

    async existsByName(name: string): Promise<boolean> {
        return this.roleRepository.exists({ name } as any);
    }
    async findByName(name: string): Promise<Role | null> {
        return this.roleRepository.findOne({ where: { name } } );
    }

    async upsertRoles(roles: Partial<Role>[]): Promise<InsertResult> {
        return this.roleRepository
            .createQueryBuilder()
            .insert()
            .into(Role)
            .values(roles)
            .orIgnore()
            .execute();
    }

}