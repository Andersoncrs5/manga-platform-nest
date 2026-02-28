import { Test, TestingModule } from '@nestjs/testing';
import { UserRoleService } from './user-role.service';
import {User} from "../user/entities/user.entity";
import {Role} from "../role/entities/role.entity";
import {UserRoleRepository} from "./user-role.repository";
import {NotFoundException} from "@nestjs/common";
import {DeleteResult, QueryFailedError} from "typeorm";
import {UserRole} from "./entities/user-role.entity";
import {UniqueConstraintViolationException} from "../utils/exceptions/classes/unique-constraint-violation.exception";

describe('UserRoleService', () => {
  let service: UserRoleService;
  let repository: UserRoleRepository;

  const mockUser: User = {
    attemptsLoginFailed: 0,
    avatarUrl: null,
    createdAt: new Date(),
    isActive: false,
    isVerified: false,
    loginBlockAt: null,
    refreshToken: null,
    registrationIp: null,
    updatedAt: undefined,
    version: 0,
    id: '1',
    username: 'John Doe',
    name: 'John Doe',
    email: "jonhDoe@gmail.com",
    password: '12345678',
    userRoles: []
  };

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

  const mockUserRole: UserRole = {
    id: '534',
    roleId: mockRole.id,
    createdAt: new Date(),
    role: mockRole,
    user: mockUser,
    userId: mockUser.id,
    version: 1,
    updatedAt: new Date(),
  }

  const mockUserRoleRepository = {
    findByUserIdAndRoleId: jest.fn(),
    existsByUserIdAndRoleId: jest.fn(),
    delete: jest.fn(),
    save: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
          UserRoleService,
          {
            provide: UserRoleRepository,
            useValue: mockUserRoleRepository,
          }
      ],
    }).compile();

    service = module.get<UserRoleService>(UserRoleService);
    repository = module.get(UserRoleRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByUserIdAndRoleId', () => {
    it('should return userRole', async () => {
      mockUserRoleRepository.findByUserIdAndRoleId.mockResolvedValue(mockUser);

      const result = await service.findByUserIdAndRoleId(mockUser.id, mockRole.id);
      expect(result).not.toBeNull()
      expect(result?.id).toBe(mockUser.id);

      expect(repository.findByUserIdAndRoleId).toHaveBeenCalledWith(mockUser.id, mockRole.id);
      expect(repository.findByUserIdAndRoleId).toHaveBeenCalledTimes(1);
    });

    it('should return null', async () => {
      mockUserRoleRepository.findByUserIdAndRoleId.mockResolvedValue(null);

      const result = await service.findByUserIdAndRoleId(mockUser.id, mockRole.id);
      expect(result).toBeNull()

      expect(repository.findByUserIdAndRoleId).toHaveBeenCalledWith(mockUser.id, mockRole.id);
      expect(repository.findByUserIdAndRoleId).toHaveBeenCalledTimes(1);
    });
  })

  describe('findByUserIdAndRoleIdSimple', () => {
    it('should return userRole', async () => {
      mockUserRoleRepository.findByUserIdAndRoleId.mockResolvedValue(mockUser);

      const result = await service.findByUserIdAndRoleIdSimple(mockUser.id, mockRole.id);
      expect(result.id).toBe(mockUser.id);

      expect(repository.findByUserIdAndRoleId).toHaveBeenCalledWith(mockUser.id, mockRole.id);
      expect(repository.findByUserIdAndRoleId).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException', async () => {
      mockUserRoleRepository.findByUserIdAndRoleId.mockResolvedValue(null);

      await expect(service.findByUserIdAndRoleIdSimple(mockUser.id, mockRole.id))
          .rejects
          .toThrow(NotFoundException);

      expect(repository.findByUserIdAndRoleId).toHaveBeenCalledWith(mockUser.id, mockRole.id);
      expect(repository.findByUserIdAndRoleId).toHaveBeenCalledTimes(1);
    });
  })

  describe('remove', () => {
    it('should delete userRole', async () => {
      const result: DeleteResult = {
        raw: 1,
        affected: 1
      }
      mockUserRoleRepository.delete.mockResolvedValue(result)

      await service.remove(mockUserRole.id)

      expect(repository.delete).toHaveBeenCalledWith(mockUserRole.id);
      expect(repository.delete).toHaveBeenCalledTimes(1);
    })

    it('should throw NotFoundException', async () => {
      const result: DeleteResult = {
        raw: 0,
        affected: 0
      }
      mockUserRoleRepository.delete.mockResolvedValue(result)

      await expect(service.remove(mockUserRole.id)).rejects.toThrow(NotFoundException);

      expect(repository.delete).toHaveBeenCalledWith(mockUserRole.id);
      expect(repository.delete).toHaveBeenCalledTimes(1);
    })
  })

  describe('create', () => {
    const dto = {
      userId: mockUser.id,
      roleId: mockRole.id,
    }

    it('should linking role to user', async () => {
      mockUserRoleRepository.save.mockResolvedValue(mockUserRole);

      const result = await service.create(mockUser.id, mockRole.id);

      expect(result.id).toBe(mockUserRole.id);

      expect(repository.save).toHaveBeenCalledWith(dto)
      expect(repository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw UniqueConstraintViolationException because user already linked in role', async () => {
      const dbError = new QueryFailedError('query', [], new Error('Duplicate entry for key idx_user_role_unique'));
      (dbError as any).errno = 1062;

      mockUserRoleRepository.save.mockRejectedValue(dbError);

      await expect(service.create(mockUser.id, mockRole.id))
          .rejects
          .toThrow(UniqueConstraintViolationException)

      try {
        await service.create(mockUser.id, mockRole.id);
      } catch (e) {
        expect(e).toBeInstanceOf(UniqueConstraintViolationException);
      }

      expect(repository.save).toHaveBeenCalledWith(dto)
      expect(repository.save).toHaveBeenCalledTimes(2);
    })

    it('should throw NotFoundException because user not found', async () => {
      const dbError = new QueryFailedError('query', [], new Error('userId'));
      (dbError as any).errno = 1452;
      (dbError as any).message = "FOREIGN KEY (userId)";

      mockUserRoleRepository.save.mockRejectedValue(dbError);

      await expect(service.create(mockUser.id, mockRole.id))
          .rejects
          .toThrow(NotFoundException)

      try {
        await service.create(mockUser.id, mockRole.id);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }

      expect(repository.save).toHaveBeenCalledWith(dto)
      expect(repository.save).toHaveBeenCalledTimes(2);
    })

    it('should throw NotFoundException because role not found', async () => {
      const dbError = new QueryFailedError('query', [], new Error('roleId'));
      (dbError as any).errno = 1452;
      (dbError as any).message = "FOREIGN KEY (roleId)";

      mockUserRoleRepository.save.mockRejectedValue(dbError);

      await expect(service.create(mockUser.id, mockRole.id))
          .rejects
          .toThrow(NotFoundException)

      try {
        await service.create(mockUser.id, mockRole.id);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }

      expect(repository.save).toHaveBeenCalledWith(dto)
      expect(repository.save).toHaveBeenCalledTimes(2);
    })

  } )

  describe('existsByUserIdAndRoleIdSimple', () => {
    it('should return true', async () => {
      mockUserRoleRepository.existsByUserIdAndRoleId.mockResolvedValue(true);

      const result = await service.existsByUserIdAndRoleIdSimple(mockUser.id, mockRole.id);

      expect(result).toBe(true);

      expect(repository.existsByUserIdAndRoleId).toHaveBeenCalledWith(mockUser.id, mockRole.id)
      expect(repository.existsByUserIdAndRoleId).toHaveBeenCalledTimes(1);
    });

    it('should return false', async () => {
      mockUserRoleRepository.existsByUserIdAndRoleId.mockResolvedValue(false);

      const result = await service.existsByUserIdAndRoleIdSimple(mockUser.id, mockRole.id);

      expect(result).toBe(false);

      expect(repository.existsByUserIdAndRoleId).toHaveBeenCalledWith(mockUser.id, mockRole.id)
      expect(repository.existsByUserIdAndRoleId).toHaveBeenCalledTimes(1);
    });
  })

});
