import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnApplicationBootstrap
} from '@nestjs/common';
import {RoleRepository} from "./role.repository";
import {Role} from "./entities/role.entity";
import {QueryFailedError} from "typeorm";
import {UniqueConstraintViolationException} from "../utils/exceptions/classes/unique-constraint-violation.exception";
import {UpdateRoleDto} from "./dto/update-role.dto";
import {BusinessException} from "../utils/exceptions/classes/business.exception";

@Injectable()
export class RoleService implements OnApplicationBootstrap   {
  constructor(
      protected readonly roleRepository: RoleRepository,
  ) {}

  async onApplicationBootstrap() {
    await this.seedInitialRoles();
  }

  async update(role: Role, dto: UpdateRoleDto): Promise<Role> {
    try {
      if (dto.name != null) role.name = dto.name;
      if (dto.description != null) role.description = dto.description;
      if (dto.isActive != null) role.isActive = dto.isActive;

      return await this.roleRepository.save(role);
    } catch (exc) {
      if (!(exc instanceof QueryFailedError)) {
        throw new InternalServerErrorException('Error update user.');
      }

      const err = exc as any;
      const errno1 = err.errno;
      const message = err.message || '';

      if (errno1 === 1062) {
        if (message.includes('idx_role_name')) {
          throw new UniqueConstraintViolationException('name', role.name);
        }
        throw new ConflictException('Duplicate data detected.');
      }

      if (errno1 === 1048) {
        throw new BusinessException('Role name is required');
      }

      if (errno1 === 1406) {
        if (message.includes("'name'")) {
          throw new BusinessException('The name exceeded the allowed character limit (100).');
        }

        if (message.includes("'description'")) {
          throw new BusinessException('The description is too long (max 255 characters).');
        }

        throw new BusinessException('One of the fields exceeded the allowed limit.');
      }

      throw new InternalServerErrorException('Database constraint error.');
    }
  }

  async create(role: Role): Promise<Role> {
    try {
      return await this.roleRepository.save(role);
    } catch (error) {
      if (!(error instanceof QueryFailedError)) {
        throw new InternalServerErrorException('Error creating user.');
      }

      const err = error as any;
      const errno = err.errno;
      const message = err.message || '';

      if (errno === 1062) {
        if (message.includes('idx_role_name')) {
          throw new UniqueConstraintViolationException('name', role.name);
        }
        throw new ConflictException('Duplicate data detected.');
      }

      if (errno === 1048) {
        throw new BusinessException('Role name is required');
      }

      if (errno === 1406) {
        if (message.includes("'name'")) {
          throw new BusinessException('The name exceeded the allowed character limit (100).');
        }

        if (message.includes("'description'")) {
          throw new BusinessException('The description is too long (max 255 characters).');
        }

        throw new BusinessException('One of the fields exceeded the allowed limit.');
      }

      throw new InternalServerErrorException('Database constraint error.');
    }
  }

  async findByIdSimple(id: string): Promise<Role> {
    const role: Role | null = await this.roleRepository.findById(id);
    if (!role) throw new NotFoundException("Role not found");

    return role;
  }

  async existsByName(name: string): Promise<boolean> {
    return await this.roleRepository.existsByName(name);
  }

  async remove(id: string): Promise<void> {
    const result = await this.roleRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Role not found');
    }
  }

  private async seedInitialRoles() {
    const roles = [
      { name: 'SUPER_ADMIN_ROLE', description: 'Administrative System' },
      { name: 'ADMIN_ROLE', description: 'Administrative System' },
      { name: 'USER_ROLE', description: 'Standard User' },
      { name: 'MODERATOR_ROLE', description: 'Standard User' },
    ];

    for (const roleData of roles) {

      const role = new Role();
      role.name = roleData.name;
      role.description = roleData.description;

      const exists = await this.existsByName(role.name);

      if (!exists) {
        await this.create(role);
      }

      if (exists) {
      }
    }
  }

}
