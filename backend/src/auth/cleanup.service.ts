import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@/prisma/prisma.service';
import { SESSION_TTL_MS } from './session.service';

@Injectable()
export class CleanupService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 0 * * *') // runs every midnight
  async cleanupExpiredSessions() {
    const expiredBefore = new Date(Date.now() - SESSION_TTL_MS);

    await Promise.all([
      this.prisma.session.deleteMany({
        where: { lastActiveAt: { lt: expiredBefore } },
      }),
      this.prisma.otpToken.deleteMany({
        where: {
          OR: [{ expiresAt: { lt: new Date() } }, { usedAt: { not: null } }],
        },
      }),
    ]);
  }
}
