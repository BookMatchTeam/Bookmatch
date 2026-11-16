import { createHmac } from 'node:crypto';
import { verify } from 'argon2';
import { VERIFICATION_CODE_MAILER } from '../../src/auth/infra/auth.tokens.js';
import { FakeVerificationCodeMailer } from '../../src/auth/testing/fake-verification-code-mailer.js';
import { validateEnvironment } from '../../src/config/environment.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';
import {
  createTestApp,
  type TestApp,
  webClientHeaders,
} from '../support/test-app.js';
import { resetDatabase } from '../support/test-database.js';

const config = validateEnvironment(process.env);

const body = {
  name: 'Ana Souza',
  email: '  Ana@Exemplo.COM ',
  password: 'senha1234',
  city: 'São Paulo',
  state: 'sp',
  acceptedTerms: true,
};

describe('Cadastro e verificação com banco (integração)', () => {
  let testApp: TestApp;
  let mailer: FakeVerificationCodeMailer;
  let prisma: PrismaService;

  beforeAll(() => {
    prisma = new PrismaService(config);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    mailer = new FakeVerificationCodeMailer();
    testApp = await createTestApp({
      config,
      overrides: [{ provide: VERIFICATION_CODE_MAILER, useValue: mailer }],
    });
  });

  afterEach(async () => {
    await testApp.app.close();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  function post(url: string, payload: object) {
    return testApp.request({
      method: 'POST',
      url,
      headers: webClientHeaders,
      payload,
    });
  }

  it('cria a conta, grava hashes e ativa com o código (CA-01, CA-03, CA-07, CA-14 a CA-16)', async () => {
    const signUp = await post('/api/auth/sign-up', body);

    expect(signUp.statusCode).toBe(201);
    expect(signUp.json()).toEqual({ email: 'ana@exemplo.com' });

    const user = await prisma.user.findUniqueOrThrow({
      where: { email: 'ana@exemplo.com' },
      include: { termsAcceptances: true, verificationCodes: true },
    });
    const code = mailer.lastCodeSentTo('ana@exemplo.com') ?? '';
    expect(user).toMatchObject({
      name: 'Ana Souza',
      city: 'São Paulo',
      state: 'SP',
      status: 'PENDING_VERIFICATION',
    });
    expect(user.passwordHash).toMatch(/^\$argon2id\$/);
    await expect(verify(user.passwordHash, 'senha1234')).resolves.toBe(true);
    expect(user.termsAcceptances).toEqual([
      expect.objectContaining({ termsVersion: config.terms.version }),
    ]);
    expect(user.verificationCodes).toEqual([
      expect.objectContaining({
        purpose: 'EMAIL_VERIFICATION',
        attempts: 0,
        codeHash: createHmac('sha256', config.verificationCode.secret)
          .update(code)
          .digest('hex'),
      }),
    ]);

    const verification = await post('/api/auth/email-verification', {
      email: 'ana@exemplo.com',
      code,
    });

    expect(verification.statusCode).toBe(204);
    const activated = await prisma.user.findUniqueOrThrow({
      where: { email: 'ana@exemplo.com' },
      include: { verificationCodes: true },
    });
    expect(activated.status).toBe('ACTIVE');
    expect(activated.verificationCodes[0].consumedAt).not.toBeNull();
  });

  it('recusa um novo cadastro com o e-mail da conta ativa (CA-11)', async () => {
    await post('/api/auth/sign-up', body);
    await post('/api/auth/email-verification', {
      email: 'ana@exemplo.com',
      code: mailer.lastCodeSentTo('ana@exemplo.com'),
    });

    const response = await post('/api/auth/sign-up', {
      ...body,
      name: 'Outra Pessoa',
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ code: 'EMAIL_ALREADY_REGISTERED' });
    expect(
      (
        await prisma.user.findUniqueOrThrow({
          where: { email: 'ana@exemplo.com' },
        })
      ).name,
    ).toBe('Ana Souza');
  });

  it('grava uma única conta com dois cadastros simultâneos (Fluxo D)', async () => {
    const responses = await Promise.all([
      post('/api/auth/sign-up', body),
      post('/api/auth/sign-up', body),
    ]);
    const statuses = responses.map(({ statusCode }) => statusCode).sort();

    // A segunda requisição recebe 409 se ler o banco antes do commit da
    // primeira, ou 429 (cadastro refeito antes de 60 s) se ler depois.
    expect(statuses[0]).toBe(201);
    expect([409, 429]).toContain(statuses[1]);
    expect(await prisma.user.count()).toBe(1);
  });

  it('soma uma tentativa ao errar o código (CA-18)', async () => {
    await post('/api/auth/sign-up', body);
    const code = mailer.lastCodeSentTo('ana@exemplo.com');

    const response = await post('/api/auth/email-verification', {
      email: 'ana@exemplo.com',
      code: code === '000000' ? '000001' : '000000',
    });

    expect(response.json()).toMatchObject({
      code: 'INVALID_VERIFICATION_CODE',
    });
    expect((await prisma.verificationCode.findFirstOrThrow()).attempts).toBe(1);
  });
});
