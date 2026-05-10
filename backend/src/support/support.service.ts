import { Injectable } from '@nestjs/common';
import { MailService } from '@/mail/mail.service';
import { SupportDto, IssueType } from './dto/support.dto';

@Injectable()
export class SupportService {
  constructor(private readonly mailService: MailService) {}

  async submitSupportRequest(dto: SupportDto) {
    const { contactEmail, issueType, subject, problemDescription, userAgent, ipAddress } = dto;

    // Create a formatted support ticket
    const ticketId = this.generateTicketId();
    const issueTypeLabel = this.getIssueTypeLabel(issueType);

    // Send email to support team
    await this.sendSupportTeamEmail({
      ticketId,
      contactEmail,
      issueType: issueTypeLabel,
      subject,
      problemDescription,
      userAgent,
      ipAddress,
    });

    // Send confirmation email to user
    await this.sendUserConfirmationEmail({
      ticketId,
      contactEmail,
      subject,
      issueType: issueTypeLabel,
    });

    return {
      message: 'Support request submitted successfully',
      ticketId,
    };
  }

  private generateTicketId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `SUP-${timestamp}-${random}`.toUpperCase();
  }

  private getIssueTypeLabel(issueType: IssueType): string {
    const labels = {
      [IssueType.LOGIN]: 'Login Issues',
      [IssueType.ACCOUNT]: 'Account Issues',
      [IssueType.TECHNICAL]: 'Technical Issues',
      [IssueType.OTHER]: 'Other',
    };
    return labels[issueType];
  }

  private async sendSupportTeamEmail(data: {
    ticketId: string;
    contactEmail: string;
    issueType: string;
    subject: string;
    problemDescription: string;
    userAgent?: string;
    ipAddress?: string;
  }) {
    const { ticketId, contactEmail, issueType, subject, problemDescription, userAgent, ipAddress } = data;

    const emailContent = `
New Support Request - ${ticketId}

Contact Email: ${contactEmail}
Issue Type: ${issueType}
Subject: ${subject}

Problem Description:
${problemDescription}

Technical Details:
${userAgent ? `User Agent: ${userAgent}` : ''}
${ipAddress ? `IP Address: ${ipAddress}` : ''}

Please respond to the user within 24 hours.
    `.trim();

    await this.mailService.sendMail(
      process.env.SUPPORT_EMAIL!,
      `New Support Request: ${subject} - ${ticketId}`,
      emailContent.replace(/\n/g, '<br>'),
    );
  }

  private async sendUserConfirmationEmail(data: {
    ticketId: string;
    contactEmail: string;
    subject: string;
    issueType: string;
  }) {
    const { ticketId, contactEmail, subject, issueType } = data;

    const emailContent = `
Thank you for contacting our support team.

Support Request Details:
Ticket ID: ${ticketId}
Issue Type: ${issueType}
Subject: ${subject}

We have received your request and will get back to you within 24 hours during business days. 
Please reference your ticket ID (${ticketId}) in any future correspondence.

Best regards,
The Support Team
    `.trim();

    await this.mailService.sendMail(
      contactEmail,
      `Support Request Received - ${ticketId}`,
      emailContent.replace(/\n/g, '<br>'),
    );
  }
}
