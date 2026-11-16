import { UuidV7IdGenerator } from './uuid-v7-id-generator.js';

const UUID_V7 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('UuidV7IdGenerator', () => {
  const idGenerator = new UuidV7IdGenerator();

  afterEach(() => {
    vi.useRealTimers();
  });

  it('gera um UUID versão 7', () => {
    expect(idGenerator.generate()).toMatch(UUID_V7);
  });

  it('gera identificadores distintos', () => {
    const ids = Array.from({ length: 1_000 }, () => idGenerator.generate());

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gera identificadores ordenáveis pelo momento de criação', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-16T10:00:00.000Z'));
    const older = idGenerator.generate();

    vi.setSystemTime(new Date('2026-11-16T10:00:01.000Z'));
    const newer = idGenerator.generate();

    expect([newer, older].sort()).toEqual([older, newer]);
  });

  it('codifica o momento de criação nos primeiros 48 bits', () => {
    vi.useFakeTimers();
    // A lib nunca gera um id anterior ao último gerado, mesmo que o relógio
    // volte. A data fica após as dos outros testes para não depender da ordem.
    const createdAt = new Date('2099-01-01T00:00:00.000Z');
    vi.setSystemTime(createdAt);

    const timestampHex = idGenerator.generate().replace('-', '').slice(0, 12);

    expect(Number.parseInt(timestampHex, 16)).toBe(createdAt.getTime());
  });
});
