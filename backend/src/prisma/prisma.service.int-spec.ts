import { validateEnvironment } from '../config/environment.js';
import { PrismaService } from './prisma.service.js';

describe('PrismaService (integração)', () => {
  let prisma: PrismaService;

  beforeAll(() => {
    prisma = new PrismaService(validateEnvironment(process.env));
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('conecta ao banco de teste configurado', async () => {
    const [{ name }] = await prisma.$queryRaw<
      { name: string }[]
    >`SELECT DATABASE() AS name`;

    expect(name).toBe(process.env.DATABASE_NAME);
    expect(name).toMatch(/_test$/);
  });

  it('encontra as migrations aplicadas pelo setup global', async () => {
    const [{ total }] = await prisma.$queryRaw<{ total: bigint }[]>`
      SELECT COUNT(*) AS total
      FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name = '_prisma_migrations'
    `;

    expect(Number(total)).toBe(1);
  });
});
