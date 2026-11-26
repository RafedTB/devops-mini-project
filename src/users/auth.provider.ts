import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JWTPayloadType } from '../utils/types';
import { MailService } from '../mail/mail.service';
import { randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthProvider {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  /**
   * creates a new user in the database after validating email the input and hashing the password.
   * @param registerDto data for creating a new user, including email, password, and optional username.
   * @returns JWT(ACCESS_TOKEN) token for the newly created user.
   */
  public async register(registerDto: RegisterDto) {
    const { email, password, username } = registerDto;
    const UserFromDb = await this.userRepository.findOne({ where: { email } });
    if (UserFromDb)
      throw new BadRequestException('User with this email already exists');
    const hashedPassword = await this.HashPassword(password);
    let newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      username,
      verificationToken: randomBytes(32).toString('hex'), // Generate a random verification token
    });
    newUser = await this.userRepository.save(newUser);

    const link = this.generateLink(newUser.id, newUser.verificationToken!);
    await this.mailService.sendVerificationMail(email, link); // Send verification email

    return { message: 'verification email sent to your email address' };
  }

  /**
   * login a user by eamil and password
   * @param loginDto data for logging in a user
   * @returns JWT(ACCESS_TOKEN) token for the logged in user.
   */
  public async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Invalid email or password');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new BadRequestException('Invalid email or password');
    if (!user.isAccountVerified) {
      let verificationToken = user.verificationToken;
      if (!verificationToken) {
        user.verificationToken = randomBytes(32).toString('hex');
        await this.userRepository.save(user);
        verificationToken = user.verificationToken;
      }
      const link = this.generateLink(user.id, verificationToken);
      await this.mailService.sendVerificationMail(email, link);
      return {
        message:
          'Account not verified. A new verification email has been sent to your email address.',
      };
    }
    const accessToken = await this.GenerateJWT({
      id: user.id,
      userType: user.userType,
    });

    return { accessToken };
  }

  /**
   * Sending a reset password email to the user with a reset password link.
   */
  public async sendResetPasswordEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user)
      throw new BadRequestException('User with this email does not exist');
    user.resetPasswordToken = randomBytes(32).toString('hex');
    await this.userRepository.save(user);
    const resetPasswordLink = `${this.config.get<string>('CLIENT_URL')}/reset-password/${user.id}/${user.resetPasswordToken}`;
    await this.mailService.sendResetPassword(user.email, resetPasswordLink);
    return { message: 'Reset password email sent to your email address.' };
  }

  /**
   * get reset password link
   */

  public async getResetPasswordLink(
    userId: number,
    resetPasswordToken: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Invalid user ID');

    if (
      user.resetPasswordToken === null ||
      user.resetPasswordToken !== resetPasswordToken
    )
      throw new BadRequestException('Invalid reset password token');
    return { message: 'Valid reset password link.' };
  }

  /**
   * reset password
   */

  public async resetPassword(dto: ResetPasswordDto) {
    const { newPassword, userId, resetPasswordToken } = dto;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Invalid user ID');

    if (
      user.resetPasswordToken === null ||
      user.resetPasswordToken !== resetPasswordToken
    )
      throw new BadRequestException('Invalid reset password token');

    const hashedPassword = await this.HashPassword(newPassword);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    await this.userRepository.save(user);
    return { message: 'Password reset successful.' };
  }

  /**
   * Hashes a password using bcrypt.
   * @param password plain text password to be hashed
   * @returns hashed password
   */
  public async HashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Generates a JWT token for the given payload.
   * @param payload JWT PAYLOAD
   * @returns TOEKN
   */
  private GenerateJWT(payload: JWTPayloadType): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  /**
   * a private method to generate a verification link for a user based on their ID and verification token.
   * @param id a user ID for which the verification link is to be generated
   * @param verificationToken a verification token associated with the user for account verification
   * @returns a verification link that can be sent to the user's email for account verification.
   */
  private generateLink(id: number, verificationToken: string): string {
    return `${this.config.get<string>('DOMAIN')}/api/users/verify/${id}/${verificationToken}`;
  }
}
