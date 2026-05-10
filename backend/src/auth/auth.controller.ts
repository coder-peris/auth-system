import { AuthProvider, type User } from '@/prisma/generated/client';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser, SessionId } from './decorators/current-user.decorator';
import { ChangeEmailDto } from './dto/change-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { MagicLinkDto, MagicLinkVerifyDto } from './dto/magic-link.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Confirm2faTotpDto, Verify2faEmailDto, Verify2faTotpDto } from './dto/verify-2fa.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { AuthGuard } from './guards/auth.guard';
import { SessionService } from './session.service';
import type { AuthenticatedRequest } from './types/request.type';
import { AccountRecoveryDto } from './dto/account-recovery.dto';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
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
    const { twoFactorRequired, twoFactorMethod, pendingSessionId, token } = await this.authService.login(
      dto,
      ip,
      userAgent,
    );
    setSessionCookie(res, token);
    return { message: 'Logged in successfully', twoFactorRequired, twoFactorMethod, pendingSessionId };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @SessionId() sessionId: string,
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.sessionService.deleteSessionById(sessionId, user.id);
    clearSessionCookie(res);
    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(@CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
    await this.sessionService.deleteAllUserSessions(user.id);
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

  @Post('2fa/email/setup')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async setup2faEmail(@CurrentUser() user: User) {
    return await this.authService.setup2faEmail(user.id);
  }

  @Post('2fa/email/confirm')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async confirm2faEmail(@Body() dto: { otp: string }, @CurrentUser() user: User) {
    await this.authService.confirm2faEmail(user.id, dto.otp);
    return { message: 'Email 2FA enabled successfully' };
  }

  @Post('2fa/disable')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async disable2fa(@CurrentUser() user: User) {
    await this.authService.disable2fa(user.id);
    return { message: 'Two-factor authentication disabled' };
  }

  @Post('2fa/email/verify')
  @HttpCode(HttpStatus.OK)
  async verify2faEmail(@Body() dto: Verify2faEmailDto) {
    await this.authService.verify2faEmail(dto.pendingSessionId, dto.otp);
    return { message: 'Two factor authentication successful' };
  }

  @Post('2fa/totp/setup')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async setup2faTotp(@CurrentUser() user: User) {
    return this.authService.setup2faTotp(user.id);
  }

  @Post('2fa/totp/confirm')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async confirm2faTotp(@Body() dto: Confirm2faTotpDto, @CurrentUser() user: User) {
    await this.authService.confirm2faTotp(user.id, dto.code);
    return { message: 'TOTP 2FA enabled successfully' };
  }

  @Post('2fa/totp/verify')
  @HttpCode(HttpStatus.OK)
  async verify2faTotp(@Body() dto: Verify2faTotpDto) {
    await this.authService.verify2faTotp(dto.pendingSessionId, dto.code);
    return { message: 'Two factor authentication successful' };
  }

  @Post('change-email/request')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async requestChangeEmail(@CurrentUser() user: User) {
    await this.authService.requestChangeEmail(user.id);
    return { message: 'Verification OTP sent to current email' };
  }

  @Patch('change-email')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async changeEmail(@Body() dto: ChangeEmailDto, @CurrentUser() user: User) {
    await this.authService.changeEmail(user.id, dto);
    return { message: 'Email changed successfully. Please verify your new email.' };
  }

  @Get('google')
  @UseGuards(PassportAuthGuard('google'))
  async googleAuth() {
    // redirects to Google — passport handles this
  }

  @Get('google/callback')
  @UseGuards(PassportAuthGuard('google'))
  async googleCallback(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const profile = req.user as unknown as {
      providerId: string;
      email: string;
      name?: string;
      avatarUrl?: string;
    };

    const token = await this.authService.oauthLogin(
      AuthProvider.GOOGLE,
      profile.providerId,
      profile.email,
      profile.name,
      profile.avatarUrl,
      req.ip,
      req.headers['user-agent'],
    );

    setSessionCookie(res, token);
    res.redirect(process.env.FRONTEND_URL!);
  }

  @Get('github')
  @UseGuards(PassportAuthGuard('github'))
  async githubAuth() {}

  @Get('github/callback')
  @UseGuards(PassportAuthGuard('github'))
  async githubCallback(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const profile = req.user as unknown as {
      providerId: string;
      email: string;
      name?: string;
      avatarUrl?: string;
    };

    const token = await this.authService.oauthLogin(
      AuthProvider.GITHUB,
      profile.providerId,
      profile.email,
      profile.name,
      profile.avatarUrl,
      req.ip,
      req.headers['user-agent'],
    );

    setSessionCookie(res, token);
    res.redirect(process.env.FRONTEND_URL!);
  }

  @Post('account-recovery')
  @HttpCode(HttpStatus.OK)
  async accountRecovery(@Body() dto: AccountRecoveryDto) {
    await this.authService.accountRecovery(dto);
    return { message: 'Account recovered successfully. Please login with your new credentials.' };
  }
}
