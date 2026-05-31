import { IsEmail, IsString, Matches } from 'class-validator';

const NO_EMOJI_REGEX = /^[^\p{Extended_Pictographic}]*$/u;

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Matches(NO_EMOJI_REGEX, { message: 'Password cannot contain emojis.' })
  password!: string;
}
