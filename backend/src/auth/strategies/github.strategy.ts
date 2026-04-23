import { AuthProvider } from '@/prisma/generated/enums';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, AuthProvider.GITHUB.toLowerCase()) {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      scope: ['user:email'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (
      error: Error | null,
      user?: {
        providerId: string;
        email: string;
        name?: string;
        avatarUrl?: string;
      },
    ) => void,
  ) {
    const { id, emails, displayName, photos } = profile;
    const email = emails?.[0].value;
    if (!email) {
      done(new Error('No email returned from GitHub'));
      return;
    }

    const user = {
      providerId: id,
      email,
      name: displayName,
      avatarUrl: photos?.[0].value,
    };
    done(null, user);
  }
}
