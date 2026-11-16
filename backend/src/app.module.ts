import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module.js';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SharedModule } from './shared/infra/shared.module.js';

@Module({
  imports: [AppConfigModule, SharedModule, PrismaModule, HealthModule],
})
export class AppModule {}
