import {BaseRepository} from "../utils/BaseRepository";
import {UserRole} from "./entities/user-role.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Injectable} from "@nestjs/common";

@Injectable()
export class UserRoleRepository extends BaseRepository<UserRole> {
    constructor(
        @InjectRepository(UserRole)
        private readonly userRoleRepository: Repository<UserRole>,
    ) {
        super(userRoleRepository);
    }

    async findByUserIdAndRoleId(userId: string, roleId: string): Promise<UserRole | null> {
        return await this.userRoleRepository.findOne({
            where: {
                userId,
                roleId
            }
        })
    }

    async existsByUserIdAndRoleId(userId: string, roleId: string): Promise<boolean> {
        return await this.userRoleRepository.exists({
            where: {
                userId,
                roleId
            }
        });
    }

    async findAllByUserId(userId: string): Promise<UserRole[]> {
        return await this.userRoleRepository.find({ where: { userId } })
    }

}