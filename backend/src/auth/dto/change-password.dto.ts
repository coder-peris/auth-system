import { IsEnum, IsString, Matches, MinLength } from 'class-validator';

const NO_EMOJI_REGEX = /^[^\p{Extended_Pictographic}]*$/u;

export enum SessionLogoutOption {
  LOGOUT_ALL = 'LOGOUT_ALL',
  LOGOUT_OTHERS = 'LOGOUT_OTHERS',
  DONT_LOGOUT = 'DONT_LOGOUT',
}

export class ChangePasswordDto {
  @IsString()
  @Matches(NO_EMOJI_REGEX, { message: 'Password cannot contain emojis.' })
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  @Matches(NO_EMOJI_REGEX, { message: 'Password cannot contain emojis.' })
  newPassword!: string;

  @IsEnum(SessionLogoutOption)
  sessionOption!: SessionLogoutOption;
}
