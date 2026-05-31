import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import crypto from 'crypto';

export const SESSION_TTL_MS = 15 * 24 * 60 * 60 * 1000; // 15 days

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
    const csrfToken = generateToken();

    await this.prisma.session.create({
      data: {
        userId,
        tokenHash: hashToken(token),
        csrfToken,
        ip,
        userAgent,
      },
    });

    return { token, csrfToken };
  }

  async validateSession(token: string) {
    const session = await this.prisma.session.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true },
    });

    if (!session) return null;

    if (session.isTwoFactorPending) return null;

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

  async validateCsrfToken(sessionId: string, csrfToken: string): Promise<boolean> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) return false;

    return session.csrfToken === csrfToken;
  }

  async deleteAllUserSessions(userId: string) {
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  async deleteAllExcept(userId: string, sessionId: string) {
    await this.prisma.session.deleteMany({
      where: { userId, id: { not: sessionId } },
    });
  }

  async getUserSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId, isTwoFactorPending: false },
      select: {
        id: true,
        ip: true,
        userAgent: true,
        createdAt: true,
        lastActiveAt: true,
      },
      orderBy: { lastActiveAt: 'desc' },
    });
  }

  async deleteSessionById(sessionId: string, userId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) throw new NotFoundException('Session not found');

    await this.prisma.session.delete({ where: { id: sessionId } });
  }

  async createPendingSession(userId: string, ip?: string, userAgent?: string) {
    const token = generateToken();
    const csrfToken = generateToken();

    const session = await this.prisma.session.create({
      data: {
        userId,
        tokenHash: hashToken(token),
        csrfToken,
        ip,
        userAgent,
        isTwoFactorPending: true,
      },
    });

    return { token, csrfToken, sessionId: session.id };
  }

  async activateSession(sessionId: string) {
    const session = await this.prisma.session.update({
      where: { id: sessionId },
      data: { isTwoFactorPending: false },
    });
    return session.csrfToken;
  }
}
