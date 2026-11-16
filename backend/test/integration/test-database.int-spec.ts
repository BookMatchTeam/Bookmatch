import { validateEnvironment } from '../../src/config/environment.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';
import {
  assertTestDatabase,
  databaseUrl,
  resetDatabase,
} from '../support/test-database.js';

describe('assertTestDatabase', () => {
  it.each(['bookmatch_test', 'outro_test'])('aceita %s', (name) => {
    expect(() => assertTestDatabase(name)).not.toThrow();
  });

  it.each(['bookmatch', 'bookmatch_test_old', '', null, undefined])(
    'recusa %j',
    (name) => {
      expect(() => assertTestDatabase(name)).toThrowError(
        /Testes de integracao recusados/,
      );
    },
  );
});

describe('databaseUrl', () => {
  it('codifica credenciais com caracteres especiais', () => {
    expect(
      databaseUrl({
        DATABASE_HOST: 'localhost',
        DATABASE_PORT: '3307',
        DATABASE_USER: 'book@match',
        DATABASE_PASSWORD: 'p/ss:w#rd',
        DATABASE_NAME: 'bookmatch_test',
      }),
    ).toBe(
      'mysql://book%40match:p%2Fss%3Aw%23rd@localhost:3307/bookmatch_test',
    );
  });
});

describe('resetDatabase (integração)', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    prisma = new PrismaService(validateEnvironment(process.env));
    await prisma.$executeRawUnsafe(
      'CREATE TABLE reset_parent (id INT PRIMARY KEY)',
    );
    await prisma.$executeRawUnsafe(
      'CREATE TABLE reset_child (id INT PRIMARY KEY, parent_id INT NOT NULL, ' +
        'FOREIGN KEY (parent_id) REFERENCES reset_parent (id))',
    );
  });

  afterAll(async () => {
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS reset_child');
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS reset_parent');
    await prisma.$disconnect();
  });

  async function count(table: string): Promise<number> {
    const [{ total }] = await prisma.$queryRawUnsafe<{ total: bigint }[]>(
      `SELECT COUNT(*) AS total FROM ${table}`,
    );

    return Number(total);
  }

  it('apaga os dados de todas as tabelas, inclusive com chaves estrangeiras', async () => {
    await prisma.$executeRawUnsafe('INSERT INTO reset_parent VALUES (1)');
    await prisma.$executeRawUnsafe('INSERT INTO reset_child VALUES (1, 1)');

    await resetDatabase(prisma);

    expect(await count('reset_parent')).toBe(0);
    expect(await count('reset_child')).toBe(0);
  });

  it('preserva o histórico de migrations', async () => {
    await resetDatabase(prisma);

    const [{ total }] = await prisma.$queryRaw<{ total: bigint }[]>`
      SELECT COUNT(*) AS total
      FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name = '_prisma_migrations'
    `;

    expect(Number(total)).toBe(1);
  });
});
