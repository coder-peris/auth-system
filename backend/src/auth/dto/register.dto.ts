import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

const NO_EMOJI_REGEX = /^[^\p{Extended_Pictographic}]*$/u;

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @Matches(NO_EMOJI_REGEX, { message: 'Password cannot contain emojis.' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required.' })
  @Matches(NO_EMOJI_REGEX, { message: 'Name cannot contain emojis.' })
  name!: string;
}
