import { Test, TestingModule } from '@nestjs/testing';
import { AuthProvider } from './auth.provider';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthProvider', () => {
  let authProvider: AuthProvider;
  let userRepository: Repository<User>;
  const REPOSITORY_TOKEN = getRepositoryToken(User);
  let mailService: MailService;
  let configService: ConfigService;
  const RegisterDto = {
    email: 'admin@gmail.com',
    username: 'admin',
    password: 'admin123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthProvider,
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: MailService,
          useValue: {
            sendVerificationMail: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: REPOSITORY_TOKEN,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn((dto: typeof RegisterDto) => Promise.resolve(dto)),
            save: jest.fn((user: User) => Promise.resolve({ ...user, id: 1 })),
          },
        },
      ],
    }).compile();

    authProvider = module.get<AuthProvider>(AuthProvider);
    userRepository = module.get<Repository<User>>(REPOSITORY_TOKEN);
    mailService = module.get<MailService>(MailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should auth provider be defined', () => {
    expect(authProvider).toBeDefined();
  });

  it('should user repository be defined', () => {
    expect(userRepository).toBeDefined();
  });

  describe('register', () => {
    it('should call findOne', async () => {
      await authProvider.register(RegisterDto);
      expect(userRepository.findOne).toHaveBeenCalled();
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
    });
    it('should call create method in userRepository', async () => {
      await authProvider.register(RegisterDto);
      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.create).toHaveBeenCalledTimes(1);
    });
    it('should save the created user', async () => {
      await authProvider.register(RegisterDto);
      expect(userRepository.save).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledTimes(1);
    });
    it('should call sendVerificationMail', async () => {
      await authProvider.register(RegisterDto);
      expect(mailService.sendVerificationMail).toHaveBeenCalled();
      expect(mailService.sendVerificationMail).toHaveBeenCalledTimes(1);
    });
    it('should call configService.get', async () => {
      await authProvider.register(RegisterDto);
      expect(configService.get).toHaveBeenCalled();
      expect(configService.get).toHaveBeenCalledTimes(1);
    });
  });
});
