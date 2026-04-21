import { IsEmail, IsOptional, IsString } from 'class-validator';

export class ChangeEmailDto {
  @IsEmail()
  newEmail!: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  otp?: string;
}
