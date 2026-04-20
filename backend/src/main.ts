import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { getIPv4 } from './lib/utils';

void (async () => {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const port = process.env.PORT ?? 3000;
  const ip = getIPv4();

  await app.listen(port);
  console.log(`- Local:\thttp://localhost:${port}\n- Network:\thttp://${ip}:${port}`);
})();
