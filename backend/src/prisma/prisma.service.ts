import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { APP_CONFIG, type AppConfig } from '../config/app-config.js';
import { PrismaClient } from '../generated/prisma/client.js';

function createAdapter(config: AppConfig['database']): PrismaMariaDb {
  return new PrismaMariaDb({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.name,
    connectionLimit: 5,
  });
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    super({ adapter: createAdapter(config.database) });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
