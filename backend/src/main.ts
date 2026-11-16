import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestNodeApplication, NodeAdapter } from '@nestjs/platform-node';
import { AppModule } from './app.module.js';
import { APP_CONFIG, type AppConfig } from './config/app-config.js';
import { configureApp } from './configure-app.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestNodeApplication>(
    AppModule,
    new NodeAdapter(),
  );

  configureApp(app);

  const config = app.get<AppConfig>(APP_CONFIG);
  await app.listen(config.server.port);
}

await bootstrap();
