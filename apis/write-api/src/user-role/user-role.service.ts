import {Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {UserRoleRepository} from "./user-role.repository";
import {UserRole} from "./entities/user-role.entity";
import {QueryFailedError} from "typeorm";
import {UniqueConstraintViolationException} from "../utils/exceptions/classes/unique-constraint-violation.exception";

@Injectable()
export class UserRoleService {
  constructor(private readonly userRoleRepository: UserRoleRepository) {
  }

  async findByUserIdAndRoleId(userId: string, roleId: string): Promise<UserRole | null > {
    return await this.userRoleRepository.findByUserIdAndRoleId(userId, roleId)
  }

  async findByUserIdAndRoleIdSimple(userId: string, roleId: string): Promise<UserRole > {
    const userRole: UserRole | null = await this.userRoleRepository.findByUserIdAndRoleId(userId, roleId)

    if (userRole == null) throw new NotFoundException(userRole);

    return userRole;
  }

  async existsByUserIdAndRoleIdSimple(userId: string, roleId: string): Promise<boolean> {
    return await this.userRoleRepository.existsByUserIdAndRoleId(userId, roleId)
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRoleRepository.delete(id);

    if (result.affected === 0) throw new NotFoundException("User role does not exist");
  }
  
  async create(userId: string, roleId: string): Promise<UserRole> {
    try {
      const dto = {
        userId: userId,
        roleId: roleId
      }

      return await this.userRoleRepository.save(dto);
    } catch (error) {
      if (!(error instanceof QueryFailedError)) {
        throw new InternalServerErrorException('Error linking user to role.');
      }

      const err = error as any;
      const errno = err.errno;
      const message = err.message || '';

      if (errno === 1062) {
        if (message.includes('idx_user_role_unique')) {
          throw new UniqueConstraintViolationException('user already linked in role', '');
        }
      }

      if (errno === 1452) {
        if (message.includes('userId')) {
          throw new NotFoundException('User not found.');
        }
        if (message.includes('roleId')) {
          throw new NotFoundException('Role not found.');
        }
        throw new NotFoundException('User or Role not found.');
      }

      throw new InternalServerErrorException('Error linking user to role.');
    }
  }

  async findAllByUserId(userId: string): Promise<UserRole[]> {
    return await this.userRoleRepository.findAllByUserId(userId)
  }

}
