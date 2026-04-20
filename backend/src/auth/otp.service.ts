import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { OtpTokenType } from '@/prisma/generated/enums';
import crypto from 'crypto';

const OTP_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class OtpService {
  constructor(private readonly prisma: PrismaService) {}

  async createOtp(email: string, type: OtpTokenType): Promise<string> {
    // invalidate any existing unused OTP of same type for this email
    await this.prisma.otpToken.updateMany({
      where: { email, type, usedAt: null },
      data: { usedAt: new Date() },
    });

    const otp = generateOtp();

    await this.prisma.otpToken.create({
      data: {
        email,
        tokenHash: hashToken(otp),
        type,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
      },
    });

    return otp;
  }

  async validateOtp(email: string, otp: string, type: OtpTokenType): Promise<boolean> {
    const token = await this.prisma.otpToken.findFirst({
      where: {
        email,
        tokenHash: hashToken(otp),
        type,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!token) return false;

    await this.prisma.otpToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() },
    });

    return true;
  }
}
