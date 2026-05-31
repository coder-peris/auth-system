import { IsBoolean, IsEmail, IsString, Length, Matches, MinLength } from 'class-validator';

const NO_EMOJI_REGEX = /^[^\p{Extended_Pictographic}]*$/u;

export class ResetPasswordDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 6)
  otp!: string;

  @IsString()
  @MinLength(8)
  @Matches(NO_EMOJI_REGEX, { message: 'Password cannot contain emojis.' })
  newPassword!: string;

  @IsBoolean()
  logoutAll!: boolean;
}
