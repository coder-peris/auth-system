import { IsEnum, IsString, MinLength } from 'class-validator';

export enum SessionLogoutOption {
  LOGOUT_ALL = 'LOGOUT_ALL',
  LOGOUT_OTHERS = 'LOGOUT_OTHERS',
  DONT_LOGOUT = 'DONT_LOGOUT',
}

export class ChangePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;

  @IsEnum(SessionLogoutOption)
  sessionOption!: SessionLogoutOption;
}
