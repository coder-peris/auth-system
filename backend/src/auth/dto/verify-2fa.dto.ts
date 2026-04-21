import { IsString, Length } from 'class-validator';

export class Verify2faEmailDto {
  @IsString()
  pendingSessionId!: string;

  @IsString()
  @Length(6, 6)
  otp!: string;
}
