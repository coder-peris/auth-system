import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    const reqId = (req.headers['x-request-id'] as string) || this.generateId();
    console.log(`\n[REQUEST] ${reqId} ${method} ${originalUrl}`);
    console.log(`Cookies:`);
    console.log(req.cookies);

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      console.log(`[RESPONSE] ${reqId} ${method} ${originalUrl} ${res.statusCode} - ${duration}ms`);
    });

    res.on('close', () => {
      if (!res.writableEnded) {
        const duration = Date.now() - startTime;
        console.warn(`[CLOSED] ${reqId} ${method} ${originalUrl} - ${duration}ms`);
      }
    });

    next();
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 10);
  }
}
