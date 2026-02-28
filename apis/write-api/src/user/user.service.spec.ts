import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import {User} from "./entities/user.entity";
import {InternalServerErrorException, NotFoundException} from "@nestjs/common";
import { CreateUserDto } from './dto/create-user.dto';
import { CryptoService } from '../utils/service/crypto/CryptoService';
import {QueryFailedError} from "typeorm";
import {UniqueConstraintViolationException} from "../utils/exceptions/classes/unique-constraint-violation.exception";
import {UpdateUserDto} from "./dto/update-user.dto";

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;
  let cryptoService: CryptoService;

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

  const dto: CreateUserDto = {
    name: mockUser.name,
    username: mockUser.username,
    email: mockUser.email,
    password: mockUser.password,
  }

  const mockUserRepository = {
    findById: jest.fn(),
    existsByEmail: jest.fn(),
    existsByUsername: jest.fn(),
    delete: jest.fn(),
    save: jest.fn(),
    findOneByEmail: jest.fn(),
  };

  const mockCryptoService = {
    encoder: jest.fn(),
    verifyPassword: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: CryptoService,
          useValue: mockCryptoService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    cryptoService = module.get<CryptoService>(CryptoService);
    repository = module.get<UserRepository>(UserRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('update', () =>  {
    const updateUserDto: UpdateUserDto = {
      username: 'new_username',
      name: 'New Name',
      password: null,
      avatarUrl: null,
    };

    it('should throw UniqueConstraintViolationException when username already exists', async () => {
      const dbError = new QueryFailedError('query', [], new Error('Duplicate entry for key idx_username'));
      (dbError as any).errno = 1062;

      mockUserRepository.save.mockRejectedValue(dbError);

      await expect(service.update(mockUser, updateUserDto))
          .rejects
          .toThrow(UniqueConstraintViolationException);

      try {
        await service.update(mockUser, updateUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UniqueConstraintViolationException);
        expect(error.field).toBe('username');
      }

      expect(mockUserRepository.save).toHaveBeenCalledTimes(2);
    });

    it('should throw InternalServerErrorException on unknown database errors', async () => {
      mockUserRepository.save.mockRejectedValue(new Error('Generic DB Error'));

      await expect(service.update(mockUser, updateUserDto))
          .rejects
          .toThrow(InternalServerErrorException);
    });
  });

  describe('create', () => {
    it('should create new user', async () => {
      mockUserRepository.save.mockReturnValue(mockUser);
      mockCryptoService.encoder.mockReturnValue(mockUser.password);

      const userCreated = await service.create(dto);

      expect(userCreated.id).toBe(mockUser.id);

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(expect.any(User));

      expect(repository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            name: dto.name,
            email: dto.email,
            password: expect.any(String),
          }),
      );

      expect(cryptoService.encoder).toHaveBeenCalledTimes(1);
      expect(cryptoService.encoder).toHaveBeenCalledWith(expect.any(String));
    });

    it('should thrown UniqueConstraintViolationException because username already exists', async () => {
      mockCryptoService.encoder.mockReturnValue(mockUser.password);

      const dbError = new QueryFailedError('query', [], new Error('Duplicate entry for key idx_username'));
      (dbError as any).errno = 1062;

      mockUserRepository.save.mockRejectedValue(dbError);

      await expect(service.create(dto))
          .rejects
          .toThrow(UniqueConstraintViolationException);

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            name: dto.name,
            email: dto.email,
            password: expect.any(String),
          }),
      );
    });

    it('should thrown UniqueConstraintViolationException because email already exists', async () => {
      mockCryptoService.encoder.mockReturnValue(mockUser.password);

      const dbError = new QueryFailedError('query', [], new Error('Duplicate entry for key idx_email'));
      (dbError as any).errno = 1062;

      mockUserRepository.save.mockRejectedValue(dbError);

      await expect(service.create(dto))
          .rejects
          .toThrow(UniqueConstraintViolationException);

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            name: dto.name,
            email: dto.email,
            password: expect.any(String),
          }),
      );
    });

  })

  describe('findOne', () => {
    it('should to return the user when the ID to valid', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findOneById(mockUser.id);

      expect(repository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(repository.findById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should return null when get user by id', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await service.findOneById(mockUser.id);

      expect(repository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(repository.findById).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });

  describe('findOneByIdSimple', () => {
    it('should return user when get by id', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findOneByIdSimple(mockUser.id);

      expect(repository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(repository.findById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.findOneByIdSimple(mockUser.id))
          .rejects
          .toThrow(NotFoundException);

      expect(repository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(repository.findById).toHaveBeenCalledTimes(1);
    });
  })

  describe('existsByEmail', () => {
    it('should return true', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(true);

      const b: boolean = await service.existsByEmail(mockUser.email);

      expect(b).toBe(true);
      expect(repository.existsByEmail).toHaveBeenCalledTimes(1);
      expect(repository.existsByEmail).toHaveBeenCalledWith(mockUser.email);
    });
    it('should return false', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(false);

      const b: boolean = await service.existsByEmail(mockUser.email);

      expect(b).toBe(false);
      expect(repository.existsByEmail).toHaveBeenCalledTimes(1);
      expect(repository.existsByEmail).toHaveBeenCalledWith(mockUser.email);
    });
  })

  describe('existsByUsername', () => {
    it('should return true', async () => {
      mockUserRepository.existsByUsername.mockResolvedValue(true);

      const b: boolean = await service.existsByUsername(mockUser.email);

      expect(b).toBe(true);
      expect(repository.existsByUsername).toHaveBeenCalledTimes(1);
      expect(repository.existsByUsername).toHaveBeenCalledWith(mockUser.email);
    });
    it('should return false', async () => {
      mockUserRepository.existsByUsername.mockResolvedValue(false);

      const b: boolean = await service.existsByUsername(mockUser.email);

      expect(b).toBe(false);
      expect(repository.existsByUsername).toHaveBeenCalledTimes(1);
      expect(repository.existsByUsername).toHaveBeenCalledWith(mockUser.email);
    });
  })

  describe('remove', () => {
    it('should delete user', async () => {
      mockUserRepository.delete.mockResolvedValue(undefined);

      await service.remove(mockUser.id);

      expect(repository.delete).toHaveBeenCalledWith(mockUser.id);
      expect(repository.delete).toHaveBeenCalledTimes(1);
    });
  })

  describe('findOneByEmail', () => {
    it('should return user when get by email', async () => {
      mockUserRepository.findOneByEmail.mockResolvedValue(mockUser);

      const result = await service.findOneByEmail(mockUser.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(mockUser.id);

      expect(repository.findOneByEmail).toHaveBeenCalledWith(mockUser.id);
      expect(repository.findOneByEmail).toHaveBeenCalledTimes(1);
    })

    it('should return null', async () => {
      mockUserRepository.findOneByEmail.mockResolvedValue(null);

      const result = await service.findOneByEmail(mockUser.id);

      expect(result).toBeNull();

      expect(repository.findOneByEmail).toHaveBeenCalledWith(mockUser.id);
      expect(repository.findOneByEmail).toHaveBeenCalledTimes(1);
    })
  })

});