import { Request } from 'express';
import type { User } from '@/prisma/generated/client';

export interface AuthenticatedRequest extends Request {
  user: User;
  sessionId: string;
}
