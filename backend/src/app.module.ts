import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { AppConfigModule } from './config/app-config.module.js';
import { EmailModule } from './email/email.module.js';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SharedModule } from './shared/infra/shared.module.js';

@Module({
  imports: [
    AppConfigModule,
    EmailModule,
    SharedModule,
    PrismaModule,
    HealthModule,
    AuthModule,
  ],
})
export class AppModule {}
