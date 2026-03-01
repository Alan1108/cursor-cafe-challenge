import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true }); // Allow frontend (Next.js) in dev
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
