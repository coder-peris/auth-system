import { AuthProvider } from '@/prisma/generated/enums';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, AuthProvider.GOOGLE.toLowerCase()) {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['email', 'profile'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) {
    const { id, emails, displayName, photos } = profile;
    const user = {
      providerId: id,
      email: emails?.[0].value,
      name: displayName,
      avatarUrl: photos?.[0].value,
    };
    done(null, user);
  }
}
