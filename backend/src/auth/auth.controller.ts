import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Delete,
  Param,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser, SessionId } from './decorators/current-user.decorator';
import type { AuthenticatedRequest } from './types/request.type';
import type { User } from '@/prisma/generated/client';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MagicLinkDto, MagicLinkVerifyDto } from './dto/magic-link.dto';
import { SessionService } from './session.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Verify2faEmailDto } from './dto/verify-2fa.dto';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
};

function setSessionCookie(res: Response, token: string) {
  res.cookie('session_token', token, COOKIE_OPTIONS);
}

function clearSessionCookie(res: Response) {
  res.clearCookie('session_token');
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: AuthenticatedRequest,
  ) {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    const { user, token } = await this.authService.register(dto, ip, userAgent);

    setSessionCookie(res, token);

    return { message: 'Registered successfully', user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: AuthenticatedRequest,
  ) {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const { twoFactorRequired, pendingSessionId, token } = await this.authService.login(dto, ip, userAgent);
    if (token) setSessionCookie(res, token);
    return { message: 'Logged in successfully', twoFactorRequired, pendingSessionId };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @SessionId() sessionId: string,
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(sessionId, user.id);
    clearSessionCookie(res);
    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(@CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
    await this.authService.logoutAll(user.id);
    clearSessionCookie(res);
    return { message: 'Logged out from all devices' };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() user: User) {
    return this.authService.getMe(user.id);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.authService.verifyEmail(dto.email, dto.otp);
    return { message: 'Email verified successfully' };
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() dto: ResendVerificationDto) {
    await this.authService.resendVerification(dto.email);
    return { message: 'Verification OTP sent' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return { message: 'If that email exists, a reset code has been sent' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.email, dto.otp, dto.newPassword, dto.logoutAll);
    return { message: 'Password reset successfully' };
  }

  @Get('sessions')
  @UseGuards(AuthGuard)
  async getSessions(@CurrentUser() user: User) {
    return this.sessionService.getUserSessions(user.id);
  }

  @Delete('sessions/:id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async revokeSession(@Param('id') sessionId: string, @CurrentUser() user: User) {
    await this.sessionService.deleteSessionById(sessionId, user.id);
    return { message: 'Session revoked successfully' };
  }

  @Post('magic-link')
  @HttpCode(HttpStatus.OK)
  async magicLinkRequest(@Body() dto: MagicLinkDto) {
    await this.authService.magicLinkRequest(dto.email);
    return { message: 'If that email exists, a magic link has been sent' };
  }

  @Post('magic-link/verify')
  @HttpCode(HttpStatus.OK)
  async magicLinkVerify(
    @Body() dto: MagicLinkVerifyDto,
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionToken = await this.authService.magicLinkVerify(
      dto.email,
      dto.token,
      req.ip,
      req.headers['user-agent'],
    );
    setSessionCookie(res, sessionToken);
    return { message: 'Logged in successfully' };
  }

  @Post('change-password')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: User,
    @SessionId() sessionId: string,
  ) {
    await this.authService.changePassword(user.id, sessionId, dto);
    return { message: 'Password changed successfully' };
  }

  @Post('2fa/email/verify')
  @HttpCode(HttpStatus.OK)
  async verify2faEmail(@Body() dto: Verify2faEmailDto) {
    await this.authService.verify2faEmail(dto.pendingSessionId, dto.otp);
    return { message: 'Two factor authentication successful' };
  }
}
