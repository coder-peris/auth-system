import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { LoggerMiddleware } from './logger/logger.middleware';
import { getIPv4 } from './lib/utils';

void (async () => {
  const app = await NestFactory.create(AppModule);
  const logger = new LoggerMiddleware();

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(cookieParser());
  app.use(logger.use.bind(logger));

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const port = process.env.PORT ?? 3000;
  const ip = getIPv4();

  await app.listen(port);
  console.log(`- Local:\thttp://localhost:${port}\n- Network:\thttp://${ip}:${port}`);
})();
