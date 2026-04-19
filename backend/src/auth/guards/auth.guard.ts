import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SessionService } from '../session.service';
import { AuthenticatedRequest } from '../types/request.type';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const cookies = request.cookies as Record<string, string | undefined>;
    const token = cookies.session_token;

    if (!token) {
      throw new UnauthorizedException('No session token provided');
    }

    const session = await this.sessionService.validateSession(token);

    if (!session) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    request.user = session.user;
    request.sessionId = session.id;

    return true;
  }
}
