import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  HttpStatus,
  UseGuards,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { join } from 'node:path';
import { usersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { AuthRolesGuard } from './guards/auth-roles.guard';
import { currentUser } from './decorators/current-user.decorator';
import type { JWTPayloadType } from '../utils/types';
import { Roles } from './decorators/user-role.decorator';
import { UserType } from '../utils/enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express, Response } from 'express';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  ApiConsumes,
  ApiBearerAuth,
  ApiBody,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { ImageUploadDto } from './dto/image-upload.dto';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: usersService) {}

  @Post('auth/register')
  @ApiOperation({ summary: 'Register a new user account' })
  public register(@Body() registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  public login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  //GET /api/users/current-user
  @Get('current-user')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  public getCurrentUser(@currentUser() payload: JWTPayloadType) {
    return this.usersService.getCurrentUser(payload.id);
  }

  //Get /api/users
  @Get()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  public getAllUsers() {
    return this.usersService.getAllUsers();
  }

  //PUT /api/users
  @Put()
  @Roles(UserType.ADMIN, UserType.USER)
  @UseGuards(AuthRolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the current user profile' })
  public updateUser(
    @currentUser() payload: JWTPayloadType,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(payload.id, updateUserDto);
  }

  //DELETE /api/users/:id
  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.USER)
  @UseGuards(AuthRolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user by ID (Admin or own account)' })
  public deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @currentUser() payload: JWTPayloadType,
  ) {
    return this.usersService.deleteUser(id, payload);
  }

  //POST /api/users/upload-profile-image
  @Post('upload-profile-image')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('user-image'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a profile image for the current user' })
  @ApiBody({
    type: ImageUploadDto,
    description: 'Upload user profile image',
  })
  public uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @currentUser() payload: JWTPayloadType,
  ) {
    if (!file)
      throw new BadRequestException('No Image uploaded or invalid file type.');
    return this.usersService.setProfileImage(payload.id, file.filename);
  }

  //DELETE /api/users/images/remove-profile-image
  @Delete('/images/remove-profile-image')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove the current user profile image' })
  public RemoveProfileImage(@currentUser() payload: JWTPayloadType) {
    return this.usersService.removeProfileImage(payload.id);
  }

  @SkipThrottle()
  @Get('/images/:image')
  @ApiOperation({ summary: 'Serve a user profile image by filename' })
  public showProfileImage(@Param('image') image: string, @Res() res: Response) {
    return res.sendFile(image, {
      root: join(process.cwd(), 'uploads/profile-images'),
    });
  }

  //GET: /api/users/verify/:id/:verificationToken
  @Get('verify/:id/:verificationToken')
  @ApiOperation({ summary: 'Verify user account via email link' })
  public async verifyAccount(
    @Param('id', ParseIntPipe) id: number,
    @Param('verificationToken') verificationToken: string,
  ) {
    return this.usersService.verifyAccount(id, verificationToken);
  }

  //POST: /api/users/forgot-password
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a password reset email to the user' })
  public forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.usersService.sendResentPassword(body.email);
  }

  //GET: /api/users/reset-password/:userId/:resetPasswordToken
  @Get('reset-password/:Id/:resetPasswordToken')
  @ApiOperation({ summary: 'Validate a password reset link' })
  public getResetPassword(
    @Param('Id', ParseIntPipe) id: number,
    @Param('resetPasswordToken') resetPasswordToken: string,
  ) {
    return this.usersService.getResetPasswordLink(id, resetPasswordToken);
  }

  //POST: /api/users/reset-password
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset the user password using the reset token' })
  public resetPassword(@Body() body: ResetPasswordDto) {
    return this.usersService.resetPassword(body);
  }
}
