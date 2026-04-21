import { MailService } from '@/mail/mail.service';
import { OtpTokenType } from '@/prisma/generated/enums';
import { PrismaService } from '@/prisma/prisma.service';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import argon2 from 'argon2';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { OtpService } from './otp.service';
import { SessionService } from './session.service';

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

    const token = await this.sessionService.createSession(user.id, ip, userAgent);
    return { user, token };
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

    const token = await this.sessionService.createSession(user.id, ip, userAgent);
    return { user, token };
  }

  async logout(sessionId: string, userId: string) {
    await this.sessionService.deleteSessionById(sessionId, userId);
  }

  async logoutAll(userId: string) {
    await this.sessionService.deleteAllUserSessions(userId);
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
    const link = `${process.env.FRONTEND_URL}/auth/magic-link?token=${token}&email=${email}`;

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

    const sessionToken = await this.sessionService.createSession(user.id, ip, userAgent);
    return sessionToken;
  }
}
