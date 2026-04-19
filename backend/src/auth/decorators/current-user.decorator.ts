import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@/prisma/generated/client';
import { AuthenticatedRequest } from '../types/request.type';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): User => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.user;
});

export const SessionId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.sessionId;
});
