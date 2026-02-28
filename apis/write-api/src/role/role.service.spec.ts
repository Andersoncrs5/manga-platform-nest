import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import {RoleRepository} from "./role.repository";
import {Role} from "./entities/role.entity";
import {DeleteResult, QueryFailedError} from "typeorm";
import {InternalServerErrorException, NotFoundException} from "@nestjs/common";
import {UniqueConstraintViolationException} from "../utils/exceptions/classes/unique-constraint-violation.exception";
import {BusinessException} from "../utils/exceptions/classes/business.exception";
import {UpdateRoleDto} from "./dto/update-role.dto";

describe('RoleService', () => {
  let service: RoleService;
  let repository: RoleRepository;

  const mockRole: Role = {
    name: "USER",
    description: 'User description',
    isActive: true,
    id: '1',
    version: 0,
    createdAt: new Date(),
    updatedAt: undefined,
    userRoles: []
  }

  const roleDto = new Role();
  roleDto.name = mockRole.name;
  roleDto.isActive = mockRole.isActive;
  roleDto.description = mockRole.description;

  const mockRoleRepository = {
    existsByName: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    findByName: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: RoleRepository,
          useValue: mockRoleRepository,
        }
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    repository = module.get<RoleRepository>(RoleRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exists role by name', () => {
    it('should return true when exists role by name', async () => {
      mockRoleRepository.existsByName.mockReturnValue(true);

      const exist: boolean = await service.existsByName(mockRole.name);
      expect(exist).toBe(true);

      expect(repository.existsByName).toHaveBeenCalledWith(mockRole.name);
      expect(repository.existsByName).toHaveBeenCalledTimes(1);
    });

    it('should return false when exists role by name', async () => {
      mockRoleRepository.existsByName.mockReturnValue(false);

      const exist: boolean = await service.existsByName(mockRole.name);
      expect(exist).toBe(false);

      expect(repository.existsByName).toHaveBeenCalledWith(mockRole.name);
      expect(repository.existsByName).toHaveBeenCalledTimes(1);
    });
  })

  describe('remove', () => {
    it('should delete role by id', async () => {
      const result: DeleteResult = {
        raw: 1,
        affected: 1
      }

      mockRoleRepository.delete.mockResolvedValue(result)

      await service.remove(mockRole.id);

      expect(repository.delete).toHaveBeenCalledWith(mockRole.id);
      expect(repository.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException', async () => {
      const result: DeleteResult = {
        raw: 0,
        affected: 0
      }

      mockRoleRepository.delete.mockResolvedValue(result)

      await expect(service.remove(mockRole.id)).rejects.toThrow(NotFoundException);

      expect(repository.delete).toHaveBeenCalledWith(mockRole.id);
      expect(repository.delete).toHaveBeenCalledTimes(1);
    });
  })

  describe('findByIdSimple', () => {
    it('should return role when get by id', async () => {
      mockRoleRepository.findById.mockResolvedValue(mockRole);

      const role = await service.findByIdSimple(mockRole.id);

      expect(role).toEqual(mockRole);
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(mockRole.id);
    });

    it('should throw NotFoundException when role does not exist', async () => {
      mockRoleRepository.findById.mockResolvedValue(null);

      await expect(service.findByIdSimple('id-inexistente'))
          .rejects
          .toThrow(NotFoundException);

      expect(mockRoleRepository.findById).toHaveBeenCalledWith('id-inexistente');
    });
  });

  describe('create', () => {
    it('should create role', async () => {
      mockRoleRepository.save.mockResolvedValue(mockRole);

      await service.create(roleDto);

      expect(mockRoleRepository.save).toHaveBeenCalledWith(roleDto);

      expect(mockRoleRepository.save).toHaveBeenCalledWith(expect.any(Role));
    });

    it('should throw NotFoundException when role name already exist', async () => {
      const dbError = new QueryFailedError('query', [], new Error('Duplicate entry for key idx_role_name'));
      (dbError as any).errno = 1062;

      mockRoleRepository.save.mockRejectedValue(dbError);

      await expect(service.create(roleDto))
          .rejects
          .toThrow(UniqueConstraintViolationException);

      try {
        await service.create(roleDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UniqueConstraintViolationException);
        expect(error.field).toBe('name');
      }
    })

    it('should throw BusinessException when role name is null', async () => {
      const dbError = new QueryFailedError('INSERT...', [], new Error("Column 'name' cannot be null"));
      (dbError as any).errno = 1048;
      (dbError as any).message = "Column 'name' cannot be null";

      mockRoleRepository.save.mockRejectedValue(dbError);

      await expect(service.create(roleDto))
          .rejects
          .toThrow(BusinessException);

      try {
        await service.create(roleDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BusinessException);
      }
    })

    it('should throw BusinessException when create role because role name exceeded the allowed character limit. ', async () => {
      const dbError = new QueryFailedError('INSERT...', [], new Error("The name exceeded the allowed character limit."));
      (dbError as any).errno = 1048;
      (dbError as any).message = "The name exceeded the allowed character limit.";

      mockRoleRepository.save.mockRejectedValue(dbError);

      await expect(service.create(roleDto))
          .rejects
          .toThrow(BusinessException);

      try {
        await service.create(roleDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BusinessException);
      }
    });

  })

  describe('update', () => {
    const dtoUpdate: UpdateRoleDto = {
      name: 'name update',
      isActive: false,
      description: 'description updated',
    };

    const existingRole = { ...mockRole, id: '1', name: 'old name' };

    it('should update role success', async () => {
      mockRoleRepository.save.mockResolvedValue({ ...existingRole, ...dtoUpdate });

      const result = await service.update(existingRole as Role, dtoUpdate);

      expect(result.name).toEqual(dtoUpdate.name);
      expect(mockRoleRepository.save).toHaveBeenCalled();
    });

    it('should throw UniqueConstraintViolationException when name already exists (1062)', async () => {
      const dbError = new QueryFailedError('query', [], new Error('Duplicate entry for key idx_role_name'));
      (dbError as any).errno = 1062;
      (dbError as any).message = 'idx_role_name';

      mockRoleRepository.save.mockRejectedValue(dbError);

      await expect(service.update(existingRole as Role, dtoUpdate))
          .rejects
          .toThrow(UniqueConstraintViolationException);
    });

    it('should throw BusinessException when name is required (1048)', async () => {
      const dbError = new QueryFailedError('query', [], new Error("Column 'name' cannot be null"));
      (dbError as any).errno = 1048;

      mockRoleRepository.save.mockRejectedValue(dbError);

      await expect(service.update(existingRole as Role, dtoUpdate))
          .rejects
          .toThrow(BusinessException);
    });

    it('should throw BusinessException when name is too long (1406)', async () => {
      const dbError = new QueryFailedError('query', [], new Error("Data too long for column 'name'"));
      (dbError as any).errno = 1406;
      (dbError as any).message = "Data too long for column 'name'";

      mockRoleRepository.save.mockRejectedValue(dbError);

      try {
        await service.update(existingRole as Role, dtoUpdate);
      } catch (error) {
        expect(error).toBeInstanceOf(BusinessException);
        expect(error.message).toContain('The name exceeded the allowed character limit');
      }
    });

    it('should throw BusinessException when description is too long (1406)', async () => {
      const dbError = new QueryFailedError('query', [], new Error("Data too long for column 'description'"));
      (dbError as any).errno = 1406;
      (dbError as any).message = "Data too long for column 'description'";

      mockRoleRepository.save.mockRejectedValue(dbError);

      try {
        await service.update(existingRole as Role, dtoUpdate);
      } catch (error) {
        expect(error).toBeInstanceOf(BusinessException);
        expect(error.message).toContain('The description is too long');
      }
    });

    it('should throw InternalServerErrorException for generic database errors', async () => {
      const dbError = new QueryFailedError('query', [], new Error('Some random db error'));
      (dbError as any).errno = 999;

      mockRoleRepository.save.mockRejectedValue(dbError);

      await expect(service.update(existingRole as Role, dtoUpdate))
          .rejects
          .toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException for non-database errors', async () => {
      mockRoleRepository.save.mockRejectedValue(new Error('Normal JS Error'));

      await expect(service.update(existingRole as Role, dtoUpdate))
          .rejects
          .toThrow(InternalServerErrorException);
    });
  });

  describe('findByNameSimple', () => {
    it('should return role', async () => {
      mockRoleRepository.findByName.mockResolvedValue(mockRole)

      const result = await service.findByNameSimple(mockRole.name);

      expect(result.id).toBe(mockRole.id);

      expect(repository.findByName).toHaveBeenCalledWith(mockRole.name);
      expect(repository.findByName).toHaveBeenCalledTimes(1);
    })

    it('should thrown NotFoundException', async () => {
      mockRoleRepository.findByName.mockResolvedValue(null)

      await expect(service.findByNameSimple(mockRole.name)).rejects.toThrow(NotFoundException);

      expect(mockRoleRepository.findByName).toHaveBeenCalledWith(mockRole.name);
      expect(mockRoleRepository.findByName).toHaveBeenCalledTimes(1);
    });
  })

});
