import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import {
  assertTestDatabase,
  databaseUrl,
  integrationEnvironment,
} from './test-database.js';

/**
 * Executado uma vez antes da suite de integracao: confere que o alvo e um
 * banco de teste e aplica as migrations do Prisma nele.
 */
export default function setup(): void {
  const environment = integrationEnvironment();
  assertTestDatabase(environment.DATABASE_NAME);

  execFileSync(resolve('node_modules/.bin/prisma'), ['migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: databaseUrl(environment) },
    stdio: 'inherit',
  });
}
