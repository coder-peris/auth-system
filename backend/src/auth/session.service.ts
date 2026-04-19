import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import * as crypto from 'crypto';

const SESSION_TTL_MS = 15 * 24 * 60 * 60 * 1000; // 15 days

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(userId: string, ip?: string, userAgent?: string) {
    const token = generateToken();

    await this.prisma.session.create({
      data: {
        userId,
        tokenHash: hashToken(token),
        ip,
        userAgent,
      },
    });

    return token;
  }

  async validateSession(token: string) {
    const session = await this.prisma.session.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true },
    });

    if (!session) return null;

    const expiry = new Date(session.lastActiveAt.getTime() + SESSION_TTL_MS);
    if (expiry < new Date()) {
      await this.prisma.session.delete({ where: { id: session.id } });
      return null;
    }

    // sliding expiry — update lastActiveAt
    await this.prisma.session.update({
      where: { id: session.id },
      data: { lastActiveAt: new Date() },
    });

    return session;
  }

  async deleteSession(sessionId: string) {
    await this.prisma.session.delete({ where: { id: sessionId } });
  }

  async deleteAllUserSessions(userId: string) {
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  async deleteAllExcept(userId: string, sessionId: string) {
    await this.prisma.session.deleteMany({
      where: { userId, id: { not: sessionId } },
    });
  }
}
