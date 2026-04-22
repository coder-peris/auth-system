import { IsString, Length } from 'class-validator';

export class Verify2faEmailDto {
  @IsString()
  pendingSessionId!: string;

  @IsString()
  @Length(6, 6)
  otp!: string;
}

export class Confirm2faTotpDto {
  @IsString()
  @Length(6, 6)
  code!: string;
}

export class Verify2faTotpDto {
  @IsString()
  pendingSessionId!: string;

  @IsString()
  @Length(6, 6)
  code!: string;
}
