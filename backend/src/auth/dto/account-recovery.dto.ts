import { IsEmail, IsString, MinLength } from 'class-validator';

export class AccountRecoveryDto {
  @IsEmail()
  email!: string;

  @IsString()
  token!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;

  @IsEmail()
  newEmail!: string;
}
