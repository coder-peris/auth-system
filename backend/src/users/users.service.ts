import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { OtpTokenType, Role } from '@/prisma/generated/enums';
import { OtpService } from '@/auth/otp.service';
import { MailService } from '@/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
  ) {}

  async getUsers(page: number, limit: number, search?: string) {
    const decodedSearch = search ? decodeURIComponent(search) : undefined;

    const where = decodedSearch
      ? {
          OR: [
            { name: { contains: decodedSearch, mode: 'insensitive' as const } },
            { email: { contains: decodedSearch, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        omit: { password: true, totpSecret: true },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.delete({ where: { id } });
  }

  async updateRole(id: string, role: Role) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id },
      data: { role },
      omit: { password: true, totpSecret: true },
    });
  }

  async forceLogout(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.session.deleteMany({ where: { userId: id } });
  }

  async sendRecoveryLink(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const RECOVERY_EXPIRY_MS = 72 * 60 * 60 * 1000; // 72 hours
    const token = await this.otpService.createUrlToken(
      user.email,
      OtpTokenType.ACCOUNT_RECOVERY,
      RECOVERY_EXPIRY_MS,
    );
    const link = `${process.env.FRONTEND_URL}/account-recovery?token=${token}&email=${encodeURIComponent(user.email)}`;

    await this.mailService.sendMail(
      user.email,
      'Account Recovery',
      `<p>An admin has initiated account recovery for your account.</p>
     <p>Click the link below to recover your account. This link expires in 72 hours.</p>
     <a href="${link}">${link}</a>`,
    );
  }
}
