import {Injectable} from "@nestjs/common";
import {BaseRepository} from "../utils/BaseRepository";
import { InjectRepository } from '@nestjs/typeorm';
import {User} from "./entities/user.entity";
import {Repository} from "typeorm";

@Injectable()
export class UserRepository extends BaseRepository<User>{
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
        super(userRepository);
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ email } as any);
    }

    async existsByEmail(email: string): Promise<boolean> {
        return this.userRepository.exists({ email } as any);
    }

    async existsByUsername(username: string): Promise<boolean> {
        return this.userRepository.exists({ username } as any);
    }

}