import { Test, TestingModule } from '@nestjs/testing';
import { usersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AuthProvider } from './auth.provider';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { UserType } from '../utils/enum';

describe('UsersService', () => {
  let service: usersService;
  let mockUserRepository: any;
  let mockAuthProvider: any;

  const mockUser: Partial<User> = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    userType: UserType.USER,
    isAccountVerified: false,
    verificationToken: 'token123',
    profileImage: null,
  };

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn().mockImplementation((u) => Promise.resolve({ ...u })),
      remove: jest.fn().mockResolvedValue(true),
    };

    mockAuthProvider = {
      register: jest.fn(),
      login: jest.fn(),
      HashPassword: jest.fn().mockResolvedValue('newhashedpassword'),
      sendResetPasswordEmail: jest.fn(),
      getResetPasswordLink: jest.fn(),
      resetPassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        usersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: AuthProvider,
          useValue: mockAuthProvider,
        },
      ],
    }).compile();

    service = module.get<usersService>(usersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentUser', () => {
    it('should return user if found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.getCurrentUser(1);
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.getCurrentUser(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllUsers', () => {
    it('should return array of users', async () => {
      mockUserRepository.find.mockResolvedValue([mockUser]);
      const result = await service.getAllUsers();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('updateUser', () => {
    it('should update username and password', async () => {
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser });
      const result = await service.updateUser(1, { username: 'newname', password: 'newpassword123' });
      expect(result.username).toBe('newname');
      expect(mockAuthProvider.HashPassword).toHaveBeenCalledWith('newpassword123');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.updateUser(99, { username: 'test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should allow user to delete their own account', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.deleteUser(1, { id: 1, userType: UserType.USER });
      expect(result).toEqual({ message: 'User deleted successfully' });
      expect(mockUserRepository.remove).toHaveBeenCalled();
    });

    it('should allow admin to delete another user account', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.deleteUser(1, { id: 2, userType: UserType.ADMIN });
      expect(result).toEqual({ message: 'User deleted successfully' });
      expect(mockUserRepository.remove).toHaveBeenCalled();
    });

    it('should forbid non-admin from deleting another user account', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      await expect(
        service.deleteUser(1, { id: 2, userType: UserType.USER })
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('verifyAccount', () => {
    it('should successfully verify user account with correct token', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        verificationToken: 'token123',
        isAccountVerified: false,
      });

      const result = await service.verifyAccount(1, 'token123');
      expect(result).toEqual({ message: 'Account verified successfully' });
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isAccountVerified: true, verificationToken: null })
      );
    });

    it('should throw BadRequestException if token is invalid', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        verificationToken: 'token123',
      });

      await expect(service.verifyAccount(1, 'wrongtoken')).rejects.toThrow(BadRequestException);
    });
  });
});

