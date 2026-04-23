import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { OtpService } from './otp.service';
import { MailModule } from '@/mail/mail.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { CleanupService } from './cleanup.service';
import { GithubStrategy } from './strategies/github.strategy';

@Module({
  imports: [MailModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionService,
    AuthGuard,
    RolesGuard,
    OtpService,
    GoogleStrategy,
    CleanupService,
    GithubStrategy,
  ],
  exports: [AuthService, SessionService],
})
export class AuthModule {}
