import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { UserRoleService } from "../user-role/user-role.service";
import { RoleService } from "../role/role.service";
import { ConfigService } from "@nestjs/config";
import { User } from "../user/entities/user.entity";
import { Role } from "../role/entities/role.entity";
import {Payload} from "./class/payload.interface";
import {CryptoService} from "../utils/service/crypto/CryptoService";

describe('AuthService', () => {
  let service: AuthService;

  const mockUserService = {
    create: jest.fn(),
    updateRefreshToken: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUserRoleService = {
    create: jest.fn(),
  };

  const mockRoleService = {
    findByNameSimple: jest.fn(),
  };

  const mockCryptoService = {
    verifyPassword: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_REFRESH_TOKEN_SECRET') return 'secret';
      if (key === 'JWT_REFRESH_TOKEN_EXPIRES_IN') return '7d';
      return null;
    }),
  };

  const mockUser = { id: '1', email: 'jonhDoe@gmail.com', username: 'John Doe' } as User;
  const mockRole = { id: '10', name: 'USER_ROLE' } as Role;

  const payload: Payload = {
    sub: mockUser.id,
    email: mockUser.email,
    username: mockUser.username,
    roles: [mockRole.name]
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserRoleService, useValue: mockUserRoleService },
        { provide: RoleService, useValue: mockRoleService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CryptoService, useValue: mockCryptoService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should register a user, link role and return tokens with user data', async () => {
      const createUserDto = { email: 'jonhDoe@gmail.com', password: '123' } as any;
      const mockUserUpdated = { ...mockUser, refreshToken: 'mocked_refresh_token' };

      mockUserService.create.mockResolvedValue(mockUser);
      mockRoleService.findByNameSimple.mockResolvedValue(mockRole);
      mockUserRoleService.create.mockResolvedValue(null);
      mockJwtService.sign.mockReturnValue('mocked_token');

      mockUserService.updateRefreshToken.mockResolvedValue(mockUserUpdated);

      const result = await service.create(createUserDto);

      expect(result).toEqual({
        tokens: {
          token: 'mocked_token',
          refreshToken: 'mocked_token',
        },
        user: mockUserUpdated,
      });

      expect(mockUserService.updateRefreshToken).toHaveBeenCalledWith(mockUser, 'mocked_token');
    });
  });

  describe('createToken', () => {
    it('should return token', () => {
      mockJwtService.sign.mockReturnValue('mocked_token');

      const token = service.createToken(mockUser, [mockRole.name]);

      expect(token).toBe('mocked_token');
      expect(mockJwtService.sign).toHaveBeenCalledWith(payload);
    });
  })

});