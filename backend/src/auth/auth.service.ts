import { MailService } from '@/mail/mail.service';
import { AuthProvider, OtpTokenType, TwoFactorMethod } from '@/prisma/generated/enums';
import { PrismaService } from '@/prisma/prisma.service';
import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import argon2 from 'argon2';
import { generateSecret, generateURI, verify } from 'otplib';
import { ChangePasswordDto, SessionLogoutOption } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { OtpService } from './otp.service';
import { SessionService } from './session.service';
import { ChangeEmailDto } from './dto/change-email.dto';
import { AccountRecoveryDto } from './dto/account-recovery.dto';

const MAX_FAILED_ATTEMPTS = 10;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionService: SessionService,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto, ip?: string, userAgent?: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const hashedPassword = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: { email: dto.email, password: hashedPassword, name: dto.name },
      omit: { password: true, updatedAt: true },
    });

    const otp = await this.otpService.createOtp(user.email, OtpTokenType.EMAIL_VERIFICATION);
    await this.mailService.sendMail(
      user.email,
      'Verify your email',
      `<p>Your verification code is:</p><h2>${otp}</h2><p>Expires in 15 minutes.</p>`,
    );

    const { token, csrfToken } = await this.sessionService.createSession(user.id, ip, userAgent);
    return { user, token, csrfToken };
  }

  async login(dto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // check lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(`Account locked. Try again in ${minutesLeft} minute(s)`);
    }

    const passwordValid = await argon2.verify(user.password, dto.password);

    if (!passwordValid) {
      const attempts = user.failedLoginAttempts + 1;
      const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: attempts,
          lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : undefined,
        },
      });

      if (shouldLock) {
        throw new UnauthorizedException('Too many failed attempts. Account locked for 30 minutes');
      }

      throw new UnauthorizedException('Invalid credentials');
    }

    // reset on successful login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });

    if (user.twoFactorMethod === TwoFactorMethod.EMAIL) {
      const { token, sessionId } = await this.sessionService.createPendingSession(user.id, ip, userAgent);
      const otp = await this.otpService.createOtp(user.email, OtpTokenType.TWO_FACTOR);
      await this.mailService.sendMail(
        user.email,
        'Your 2FA code',
        `<p>Your verification code is:</p><h2>${otp}</h2><p>Expires in 15 minutes.</p>`,
      );
      return {
        twoFactorRequired: true,
        twoFactorMethod: TwoFactorMethod.EMAIL,
        pendingSessionId: sessionId,
        token,
      };
    }

    if (user.twoFactorMethod === TwoFactorMethod.TOTP) {
      const { token, sessionId } = await this.sessionService.createPendingSession(user.id, ip, userAgent);
      return {
        twoFactorRequired: true,
        twoFactorMethod: TwoFactorMethod.TOTP,
        pendingSessionId: sessionId,
        token,
      };
    }

    const { token, csrfToken } = await this.sessionService.createSession(user.id, ip, userAgent);

    return { twoFactorRequired: false, token, csrfToken };
  }

  async verify2faEmail(pendingSessionId: string, otp: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: pendingSessionId, isTwoFactorPending: true },
      include: { user: true },
    });

    if (!session) throw new UnauthorizedException('Invalid or expired 2FA session');

    const valid = await this.otpService.validateOtp(session.user.email, otp, OtpTokenType.TWO_FACTOR);
    if (!valid) throw new UnauthorizedException('Invalid or expired OTP');

    const csrfToken = await this.sessionService.activateSession(pendingSessionId);
    return { csrfToken };
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
        twoFactorMethod: true,
        createdAt: true,
      },
    });
  }

  async verifyEmail(email: string, otp: string) {
    const valid = await this.otpService.validateOtp(email, otp, OtpTokenType.EMAIL_VERIFICATION);
    if (!valid) throw new UnauthorizedException('Invalid or expired OTP');

    await this.prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });
  }

  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.isVerified) throw new ConflictException('Email already verified');

    const otp = await this.otpService.createOtp(email, OtpTokenType.EMAIL_VERIFICATION);
    await this.mailService.sendMail(
      email,
      'Verify your email',
      `<p>Your verification code is:</p><h2>${otp}</h2><p>Expires in 15 minutes.</p>`,
    );
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // don't leak user existence
    if (!user) return;

    const otp = await this.otpService.createOtp(email, OtpTokenType.PASSWORD_RESET);
    await this.mailService.sendMail(
      email,
      'Reset your password',
      `<p>Your password reset code is:</p><h2>${otp}</h2><p>Expires in 15 minutes.</p>`,
    );
  }

  async resetPassword(email: string, otp: string, newPassword: string, logoutAll: boolean) {
    const valid = await this.otpService.validateOtp(email, otp, OtpTokenType.PASSWORD_RESET);
    if (!valid) throw new UnauthorizedException('Invalid or expired OTP');

    const hashedPassword = await argon2.hash(newPassword);
    await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    if (logoutAll) {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (user) await this.sessionService.deleteAllUserSessions(user.id);
    }
  }

  async magicLinkRequest(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // don't leak user existence
    if (!user) return;

    const token = await this.otpService.createUrlToken(email, OtpTokenType.MAGIC_LINK);
    const link = `${process.env.FRONTEND_URL}/magic-link-verify?token=${token}&email=${email}`;

    await this.mailService.sendMail(
      email,
      'Your magic link',
      `<p>Click the link below to log in:</p><a href="${link}">${link}</a><p>Expires in 15 minutes.</p>`,
    );
  }

  async magicLinkVerify(email: string, token: string, ip?: string, userAgent?: string) {
    const valid = await this.otpService.validateOtp(email, token, OtpTokenType.MAGIC_LINK);
    if (!valid) throw new UnauthorizedException('Invalid or expired magic link');

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid or expired magic link');

    const { token: sessionToken, csrfToken } = await this.sessionService.createSession(
      user.id,
      ip,
      userAgent,
    );
    return { token: sessionToken, csrfToken };
  }

  async changePassword(userId: string, sessionId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new UnauthorizedException('User not found');

    const passwordValid = await argon2.verify(user.password, dto.currentPassword);
    if (!passwordValid) throw new UnauthorizedException('Current password is wrong');

    const hashedPassword = await argon2.hash(dto.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    if (dto.sessionOption === SessionLogoutOption.LOGOUT_ALL) {
      await this.sessionService.deleteAllUserSessions(userId);
    } else if (dto.sessionOption === SessionLogoutOption.LOGOUT_OTHERS) {
      await this.sessionService.deleteAllExcept(userId, sessionId);
    }
  }

  async setup2faTotp(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    if (!user.isVerified) throw new ForbiddenException('Email not verified');
    if (user.twoFactorMethod === 'TOTP') throw new ConflictException('TOTP already enabled');

    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: 'Auth System',
      label: user.email,
      secret,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { totpSecret: secret },
    });

    return { otpauthUrl };
  }

  async confirm2faTotp(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.totpSecret) throw new UnauthorizedException('TOTP setup not initiated');

    const result = await verify({ secret: user.totpSecret, token: code });
    if (!result.valid) throw new UnauthorizedException('Invalid TOTP code');

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorMethod: 'TOTP' },
    });
  }

  async verify2faTotp(pendingSessionId: string, code: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: pendingSessionId, isTwoFactorPending: true },
      include: { user: true },
    });

    if (!session) throw new UnauthorizedException('Invalid or expired 2FA session');
    if (!session.user.totpSecret) throw new UnauthorizedException('TOTP not configured');

    const result = await verify({ secret: session.user.totpSecret, token: code });
    if (!result.valid) throw new UnauthorizedException('Invalid TOTP code');

    const csrfToken = await this.sessionService.activateSession(pendingSessionId);
    return { csrfToken };
  }

  async requestChangeEmail(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    if (!user.isVerified) throw new ForbiddenException('Only verified users can use this endpoint');

    const otp = await this.otpService.createOtp(user.email, OtpTokenType.TWO_FACTOR);
    await this.mailService.sendMail(
      user.email,
      'Change email verification',
      `<p>Your verification code is:</p><h2>${otp}</h2><p>Expires in 15 minutes.</p>`,
    );
  }

  async changeEmail(userId: string, dto: ChangeEmailDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const existing = await this.prisma.user.findUnique({ where: { email: dto.newEmail } });
    if (existing) throw new ConflictException('Email already in use');

    if (!user.isVerified) {
      // unverified — verify password
      if (!dto.password) throw new UnauthorizedException('Password required');
      if (!user.password) throw new UnauthorizedException('Invalid credentials');
      const passwordValid = await argon2.verify(user.password, dto.password);
      if (!passwordValid) throw new UnauthorizedException('Invalid credentials');
    } else {
      // verified — validate OTP
      if (!dto.otp) throw new UnauthorizedException('OTP required');
      const valid = await this.otpService.validateOtp(user.email, dto.otp, OtpTokenType.TWO_FACTOR);
      if (!valid) throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { email: dto.newEmail, isVerified: false },
    });

    // send verification OTP to new email
    const otp = await this.otpService.createOtp(dto.newEmail, OtpTokenType.EMAIL_VERIFICATION);
    await this.mailService.sendMail(
      dto.newEmail,
      'Verify your new email',
      `<p>Your verification code is:</p><h2>${otp}</h2><p>Expires in 15 minutes.</p>`,
    );
  }

  async oauthLogin(
    provider: AuthProvider,
    providerId: string,
    email: string,
    name?: string,
    avatarUrl?: string,
    ip?: string,
    userAgent?: string,
  ) {
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // new user — create with provider
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          avatarUrl,
          isVerified: true,
          userProviders: {
            create: { provider, providerId },
          },
        },
      });
    } else {
      // existing user — check if provider already linked
      const existingProvider = await this.prisma.userProvider.findUnique({
        where: { userId_provider: { userId: user.id, provider } },
      });

      if (!existingProvider) {
        // merge — link provider to existing account
        await this.prisma.userProvider.create({
          data: { userId: user.id, provider, providerId },
        });
      }
    }

    const { token, csrfToken } = await this.sessionService.createSession(user.id, ip, userAgent);
    return { token, csrfToken };
  }

  async setup2faEmail(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    if (!user.isVerified) throw new ForbiddenException('Email not verified');

    const otp = await this.otpService.createOtp(user.email, OtpTokenType.TWO_FACTOR);
    await this.mailService.sendMail(
      user.email,
      'Enable 2FA Verification',
      `<p>Your verification code to enable Email 2FA is:</p><h2>${otp}</h2><p>Expires in 15 minutes.</p>`,
    );

    return { message: 'Verification OTP sent to your email' };
  }

  async confirm2faEmail(userId: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const valid = await this.otpService.validateOtp(user.email, otp, OtpTokenType.TWO_FACTOR);
    if (!valid) throw new UnauthorizedException('Invalid or expired OTP');

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorMethod: TwoFactorMethod.EMAIL },
    });
  }

  async disable2fa(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorMethod: TwoFactorMethod.NONE, totpSecret: null },
    });
  }

  async accountRecovery(dto: AccountRecoveryDto) {
    const valid = await this.otpService.validateOtp(dto.email, dto.token, OtpTokenType.ACCOUNT_RECOVERY);
    if (!valid) throw new UnauthorizedException('Invalid or expired recovery link');

    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid or expired recovery link');

    const hashedPassword = await argon2.hash(dto.newPassword);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: dto.newEmail,
        password: hashedPassword,
        twoFactorMethod: 'NONE',
        totpSecret: null,
        isVerified: true,
      },
    });

    await this.sessionService.deleteAllUserSessions(user.id);
  }
}
