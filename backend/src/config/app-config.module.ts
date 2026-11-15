import 'dotenv/config';
import { Global, Module } from '@nestjs/common';
import { APP_CONFIG, type AppConfig } from './app-config.js';
import { validateEnvironment } from './environment.js';

@Global()
@Module({
  providers: [
    {
      provide: APP_CONFIG,
      useFactory: (): AppConfig => validateEnvironment(process.env),
    },
  ],
  exports: [APP_CONFIG],
})
export class AppConfigModule {}
