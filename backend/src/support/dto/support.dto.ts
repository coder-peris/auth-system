import { IsEmail, IsEnum, IsString, IsOptional, Length } from 'class-validator';

export enum IssueType {
  LOGIN = 'login',
  ACCOUNT = 'account',
  TECHNICAL = 'technical',
  OTHER = 'other',
}

export class SupportDto {
  @IsEmail()
  @IsString()
  contactEmail: string;

  @IsEnum(IssueType)
  issueType: IssueType;

  @IsString()
  @Length(5, 100, { message: 'Subject must be between 5 and 100 characters' })
  subject: string;

  @IsString()
  @Length(20, 1000, {
    message: 'Problem description must be between 20 and 1000 characters',
  })
  problemDescription: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}
