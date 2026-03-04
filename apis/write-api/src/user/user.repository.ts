import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {BaseRepository} from "../utils/BaseRepository";
import { InjectRepository } from '@nestjs/typeorm';
import {User} from "./entities/user.entity";
import {Repository} from "typeorm";
import {isEmail} from "class-validator";

@Injectable()
export class UserRepository extends BaseRepository<User>{
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
        super(userRepository);
    }

    async findOneByEmail(email: string): Promise<User | null> {
        if (!email || !isEmail(email)) {
            throw new BadRequestException('Invalid email format');
        }
        return this.userRepository.findOne({where: { email }});
    }

    async existsByEmail(email: string): Promise<boolean> {
        if (!email || !isEmail(email)) {
            throw new BadRequestException('Invalid email format');
        }

        return this.userRepository.exists({where: { email }});
    }

    async existsByUsername(username: string): Promise<boolean> {
        if (!username) {
            throw new BadRequestException('Invalid email format');
        }

        return this.userRepository.exists({where: { username }});
    }

}