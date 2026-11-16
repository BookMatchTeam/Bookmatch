import type { PrismaClient } from '../../src/generated/prisma/client.js';

/**
 * Ambiente dos testes de integracao.
 *
 * Usa variaveis proprias (TEST_DATABASE_*) para que o .env de desenvolvimento
 * nunca seja aproveitado por engano. Os valores padrao apontam para o servico
 * `mariadb-test` do compose.yaml (npm run db:test:up) e para o servico do CI.
 */
export function integrationEnvironment(): Record<string, string> {
  return {
    PORT: '3000',
    DATABASE_HOST: process.env.TEST_DATABASE_HOST ?? 'localhost',
    DATABASE_PORT: process.env.TEST_DATABASE_PORT ?? '3307',
    DATABASE_USER: process.env.TEST_DATABASE_USER ?? 'bookmatch',
    DATABASE_PASSWORD: process.env.TEST_DATABASE_PASSWORD ?? 'bookmatch_test',
    DATABASE_NAME: process.env.TEST_DATABASE_NAME ?? 'bookmatch_test',
    TERMS_VERSION: '1',
    CORS_ORIGINS: 'http://localhost:5173,http://localhost:3000',
    VERIFICATION_CODE_SECRET: 'segredo-de-teste-com-32-caracteres!',
    // Nenhum e-mail sai nos testes de integracao: o serviço e substituído.
    SMTP_HOST: 'smtp.gmail.com',
    SMTP_PORT: '465',
    SMTP_SECURE: 'true',
    SMTP_USER: 'teste@gmail.com',
    SMTP_PASSWORD: 'senha-de-app',
    EMAIL_FROM_NAME: 'BookMatch',
    EMAIL_FROM_ADDRESS: 'teste@gmail.com',
  };
}

export function databaseUrl(environment: Record<string, string>): string {
  const user = encodeURIComponent(environment.DATABASE_USER);
  const password = encodeURIComponent(environment.DATABASE_PASSWORD);

  return `mysql://${user}:${password}@${environment.DATABASE_HOST}:${environment.DATABASE_PORT}/${environment.DATABASE_NAME}`;
}

/**
 * Trava de seguranca: os testes de integracao apagam dados. So aceitam bancos
 * cujo nome termina em `_test`, para nunca atingir o banco de desenvolvimento
 * ou o de producao.
 */
export function assertTestDatabase(databaseName: string | null | undefined) {
  if (!databaseName?.endsWith('_test')) {
    throw new Error(
      `Testes de integracao recusados: o banco "${databaseName ?? ''}" nao termina em "_test".`,
    );
  }
}

/**
 * Apaga os dados de todas as tabelas do banco de teste, preservando o
 * historico de migrations. Chamado entre os testes para isola-los.
 */
export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  const [{ name: databaseName }] = await prisma.$queryRaw<
    { name: string | null }[]
  >`SELECT DATABASE() AS name`;
  assertTestDatabase(databaseName);

  const tables = await prisma.$queryRaw<{ name: string }[]>`
    SELECT table_name AS name
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_type = 'BASE TABLE'
      AND table_name <> '_prisma_migrations'
  `;

  if (tables.length === 0) {
    return;
  }

  // FOREIGN_KEY_CHECKS vale por conexao: a transacao garante que todos os
  // comandos usem a mesma conexao do pool.
  await prisma.$transaction(async (transaction) => {
    await transaction.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');

    for (const { name } of tables) {
      await transaction.$executeRawUnsafe(
        `DELETE FROM \`${name.replaceAll('`', '``')}\``,
      );
    }

    await transaction.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');
  });
}
