import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { User } from '../users/user.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * sends a login notification email to the user after successful login.
   * @param user the logged in user object containing email and username.
   */
  public async sendLoginMail(user: User) {
    try {
      const today = new Date();
      await this.mailerService.sendMail({
        to: user.email,
        from: `<no-reply@mynestjs.com>`,
        subject: 'Login Notification',
        template: 'login', // Name of the template file (without extension)
        context: {
          user: {
            name: user.username,
            email: user.email,
          },
          loginTime: today.toLocaleString(),
        },
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException('Error sending email');
    }
  }

  /**
   * asynchronously sends a verification email to the user with a verification link.
   * @param email email address of the user to whom the verification email is to be sent.
   * @param link link to be included in the email for account verification.
   */
  public async sendVerificationMail(email: string, link: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: `<no-reply@mynestjs.com>`,
        subject: 'verify your account',
        template: 'verification-email', // Name of the template file (without extension)
        context: { link },
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException('Error sending email');
    }
  }

  /**
   * asynchronously sends a reset password email to the user with a reset password link.
   * @param email an email address of the user to whom the reset password email is to be sent.
   * @param resetPasswordLink a link to be included in the email for resetting the user's password.
   */
  public async sendResetPassword(email: string, resetPasswordLink: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: `<no-reply@mynestjs.com>`,
        subject: 'Reset Password',
        template: 'reset-password',
        context: { resetPasswordLink },
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException('Error sending email');
    }
  }
}
