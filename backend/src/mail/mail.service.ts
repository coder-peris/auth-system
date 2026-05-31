import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendMail(to: string, subject: string, html: string) {
    await this.resend.emails.send({
      from: `Auth System <${process.env.MAIL_FROM}>`,
      to,
      subject,
      html,
    });
  }
}
