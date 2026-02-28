import {ConflictException, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {UserRepository} from './user.repository';
import {User} from "./entities/user.entity";
import {CryptoService} from "../utils/service/crypto/CryptoService";
import {QueryFailedError} from "typeorm";
import {UniqueConstraintViolationException} from "../utils/exceptions/classes/unique-constraint-violation.exception";
import * as cluster from "node:cluster";

@Injectable()
export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly crypto: CryptoService,
  ){}

  async updateRefreshToken(user: User, refreshToken: string): Promise<User> {
    user.refreshToken = refreshToken;

    return await this.repository.save(user);
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user = new User()

    user.name = dto.name;
    user.username = dto.username;
    user.email = dto.email;
    user.password = await this.crypto.encoder(dto.password);

    try {
      return await this.repository.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError && (error as any).errno === 1062) {
        const message = error.message;

        if (message.includes('idx_username')) {
          throw new UniqueConstraintViolationException('username', dto.username);
        }

        if (message.includes('idx_email')) {
          throw new UniqueConstraintViolationException('email', dto.email);
        }

        throw new ConflictException('Duplicate data detected.');
      }

      throw new InternalServerErrorException('Error creating user.');
    }
  }

  async findOneById(id: string): Promise<User | null> {
    return await this.repository.findById(id)
  }

  async findOneByIdSimple(id: string): Promise<User> {
    const user: User | null = await this.repository.findById(id);

    if (!user) throw new NotFoundException("User not found");

    return user
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.repository.existsByEmail(email);
  }

  async existsByUsername(username: string): Promise<boolean> {
    return this.repository.existsByUsername(username);
  }

  async update(user: User, dto: UpdateUserDto) {
    user.username = dto.username ?? user.username;
    user.name = dto.name ?? user.name;
    user.avatarUrl = dto.avatarUrl ?? user.avatarUrl;

    if (dto.password != null) {
      user.password = await this.crypto.encoder(dto.password);
    }

    try {
      return await this.repository.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError && (error as any).errno === 1062) {
        const message = error.message;

        if (message.includes('idx_username')) {
          throw new UniqueConstraintViolationException('username', dto.username);
        }

        throw new ConflictException('Duplicate data detected.');
      }

      throw new InternalServerErrorException('Error updating user.');
    }
  }

  async remove(id: string) {
    await this.repository.delete(id)
  }

  async findOneByEmail(email: string): Promise<User | null > {
    return await this.repository.findOneByEmail(email);
  }
}
