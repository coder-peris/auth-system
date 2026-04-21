import { IsEmail, IsString } from 'class-validator';

export class MagicLinkDto {
  @IsEmail()
  email!: string;
}

export class MagicLinkVerifyDto {
  @IsEmail()
  email!: string;

  @IsString()
  token!: string;
}
