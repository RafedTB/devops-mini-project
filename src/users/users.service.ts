import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto } from './dto/login.dto';
import { JWTPayloadType } from '../utils/types';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserType } from '../utils/enum';
import { AuthProvider } from './auth.provider';
import { join } from 'node:path';
import { unlinkSync } from 'node:fs';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class usersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly authProvider: AuthProvider,
  ) {}

  /**
   * creates a new user in the database after validating email the input and hashing the password.
   * @param registerDto data for creating a new user, including email, password, and optional username.
   * @returns JWT(ACCESS_TOKEN) token for the newly created user.
   */
  public async register(registerDto: RegisterDto) {
    return this.authProvider.register(registerDto);
  }

  /**
   * login a user by eamil and password
   * @param loginDto data for logging in a user
   * @returns JWT(ACCESS_TOKEN) token for the logged in user.
   */
  public async login(loginDto: LoginDto) {
    return this.authProvider.login(loginDto);
  }

  /**
   * get currecnt user (logged in user) by id
   * @param id id of the user to be retrieved
   * @returns the user from database
   */
  public async getCurrentUser(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Get All users form database
   * @returns collection of users from database
   */
  public getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * Update user by id and updateUserDto
   * @param id id of the logged in user to be updated
   * @param updateUserDto data for updating the user, including optional password and username.
   * @returns the updated user
   */
  public async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const { password, username } = updateUserDto;
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.username = username ?? user.username;
    if (password) {
      user.password = await this.authProvider.HashPassword(password);
    }
    return this.userRepository.save(user);
  }

  /**
   * delete user by id and payload
   * @param userid id of the user to be deleted
   * @param payload JWT payload of the logged in user
   * @returns a success message if the user is deleted successfully, otherwise throws a ForbiddenException if the logged in user is not authorized to delete the user.
   */
  public async deleteUser(userid: number, payload: JWTPayloadType) {
    const user = await this.getCurrentUser(userid);
    if (user.id === payload?.id || payload.userType === UserType.ADMIN) {
      await this.userRepository.remove(user);
      return { message: 'User deleted successfully' };
    }
    throw new ForbiddenException('You are not authorized to delete this user');
  }

  /**
   * assign a profile image to the user by updating the user's profileImage field in the database.
   * @param userId userId of the user to be updated
   * @param imagePath  path of the image to be assigned to the user
   * @returns image path of the assigned image
   */
  public async setProfileImage(userId: number, imagePath: string) {
    const user = await this.getCurrentUser(userId);
    if (user.profileImage === null) {
      user.profileImage = imagePath;
    } else {
      await this.removeProfileImage(userId);
      user.profileImage = imagePath;
    }

    return this.userRepository.save(user);
  }

  /**
   * remove the profile image of the user by deleting the image file from the server and updating the user's profileImage field in the database.
   * @param userId userId of the user whose profile image is to be removed
   * @returns returns the updated user object after removing the profile image.
   */
  public async removeProfileImage(userId: number) {
    const user = await this.getCurrentUser(userId);
    if (user.profileImage === null)
      throw new BadRequestException('No profile image to remove');
    const imagePath = join(
      process.cwd(),
      `./uploads/profile-images/${user.profileImage}`,
    );
    unlinkSync(imagePath);
    user.profileImage = null;
    return this.userRepository.save(user);
  }

  public async verifyAccount(userId: number, verificationToken: string) {
    const user = await this.getCurrentUser(userId);
    if (user.verificationToken === null)
      throw new NotFoundException(
        'theree is no verification token for this user',
      );
    if (user.verificationToken !== verificationToken)
      throw new BadRequestException('Invalid verification token');
    user.isAccountVerified = true;
    user.verificationToken = null;
    await this.userRepository.save(user);
    return { message: 'Account verified successfully' };
  }

  /**
   * a method to send a reset password email to the user with a reset password link.
   * @param email email of the user to whom the reset password email is to be sent
   * @returns returns a success message if the reset password email is sent successfully, otherwise throws a BadRequestException if the user with the given email does not exist.
   */
  public sendResentPassword(email: string) {
    return this.authProvider.sendResetPasswordEmail(email);
  }

  /**
   * a method to validate the reset password link by checking if the user with the given userId exists and if the resetPasswordToken matches the one stored in the database for that user.
   * @param userId a user ID for which the reset password link is to be validated
   * @param resetPasswordToken reset password token associated with the user for resetting the password
   * @returns returns a success message if the reset password link is valid, otherwise throws a BadRequestException if the user with the given userId does not exist or if the resetPasswordToken does not match the one stored in the database for that user.
   */
  public getResetPasswordLink(userId: number, resetPasswordToken: string) {
    return this.authProvider.getResetPasswordLink(userId, resetPasswordToken);
  }

  /**
   * a method to reset the password of a user by validating the reset password token and updating the user's password in the database.
   * @param dto dto containing the new password, user ID, and reset password token for resetting the password
   * @returns returns a success message if the password is reset successfully, otherwise throws a BadRequestException if the reset password token is invalid or the user with the given ID does not exist.
   */
  public resetPassword(dto: ResetPasswordDto) {
    return this.authProvider.resetPassword(dto);
  }
}
