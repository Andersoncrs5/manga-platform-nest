import {Injectable, NotFoundException} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {UserRepository} from './user.repository';
import {User} from "./entities/user.entity";
import {CryptoService} from "../utils/service/crypto/CryptoService";

@Injectable()
export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly crypto: CryptoService,
  ){}
  
  async create(dto: CreateUserDto) {
    const user = new User()

    user.name = dto.name;
    user.username = dto.username;
    user.email = dto.email;
    user.password = await this.crypto.encoder(dto.password);

    return await this.repository.save(user);
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

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    await this.repository.delete(id)
  }
}
