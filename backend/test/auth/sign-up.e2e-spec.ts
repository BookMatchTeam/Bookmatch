import { createHmac } from 'node:crypto';
import { verify } from 'argon2';
import {
  createAuthTestApp,
  type AuthTestApp,
} from '../support/auth-test-app.js';
import { testConfig, webClientHeaders } from '../support/test-app.js';

const validBody = {
  name: 'Ana Souza',
  email: 'ana@exemplo.com',
  password: 'Senha@1234',
  city: 'São Paulo',
  state: 'SP',
  acceptedTerms: true,
};

describe('POST /api/auth/sign-up (e2e)', () => {
  let testApp: AuthTestApp;

  beforeEach(async () => {
    testApp = await createAuthTestApp();
  });

  afterEach(async () => {
    await testApp.app.close();
  });

  function signUp(payload: object) {
    return testApp.request({
      method: 'POST',
      url: '/api/auth/sign-up',
      headers: webClientHeaders,
      payload,
    });
  }

  it('cria a conta pendente e envia o código (CA-01)', async () => {
    const response = await signUp(validBody);

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({ email: 'ana@exemplo.com' });
    expect(testApp.database.userByEmail('ana@exemplo.com')?.status).toBe(
      'PENDING_VERIFICATION',
    );
    expect(testApp.database.termsAcceptances).toHaveLength(1);
    expect(testApp.database.verificationCodes).toHaveLength(1);
    expect(testApp.mailer.sent).toEqual([
      { to: 'ana@exemplo.com', code: expect.stringMatching(/^\d{6}$/) },
    ]);
  });

  it('responde com o e-mail normalizado (CA-03)', async () => {
    const response = await signUp({
      ...validBody,
      email: '  Ana@Exemplo.COM ',
      state: 'sp',
    });

    expect(response.json()).toEqual({ email: 'ana@exemplo.com' });
    expect(testApp.database.userByEmail('ana@exemplo.com')?.state).toBe('SP');
  });

  it('grava a senha como hash Argon2id, sem devolvê-la (CA-14)', async () => {
    const response = await signUp(validBody);
    const user = testApp.database.userByEmail('ana@exemplo.com');

    expect(user?.passwordHash).toMatch(/^\$argon2id\$/);
    await expect(verify(user?.passwordHash ?? '', 'Senha@1234')).resolves.toBe(
      true,
    );
    expect(response.payload).not.toContain('Senha@1234');
  });

  it('grava o HMAC-SHA-256 do código enviado (CA-15)', async () => {
    await signUp(validBody);
    const code = testApp.mailer.lastCodeSentTo('ana@exemplo.com') ?? '';

    expect(testApp.database.verificationCodes[0].codeHash).toBe(
      createHmac('sha256', testConfig.verificationCode.secret)
        .update(code)
        .digest('hex'),
    );
  });

  it('grava o aceite da versão vigente no horário do Clock (CA-10)', async () => {
    await signUp(validBody);

    expect(testApp.database.termsAcceptances[0]).toMatchObject({
      termsVersion: testConfig.terms.version,
      acceptedAt: testApp.clock.now(),
    });
  });

  it.each([
    ['nome curto (CA-02)', { name: ' A ' }, 'INVALID_NAME'],
    ['nome longo (CA-02)', { name: 'x'.repeat(101) }, 'INVALID_NAME'],
    ['e-mail inválido (CA-04)', { email: 'ana@' }, 'INVALID_EMAIL'],
    [
      'senha sem maiúscula (CA-05)',
      { password: 'senha@1234' },
      'INVALID_PASSWORD',
    ],
    [
      'senha sem caractere especial (CA-05)',
      { password: 'Senha1234' },
      'INVALID_PASSWORD',
    ],
    [
      'senha sem número (CA-05)',
      { password: 'Senha@abcd' },
      'INVALID_PASSWORD',
    ],
    ['senha curta (CA-05)', { password: 'Sen@1' }, 'INVALID_PASSWORD'],
    [
      'senha só com espaço como especial (CA-05)',
      { password: 'Senha 1234' },
      'INVALID_PASSWORD',
    ],
    ['cidade curta (CA-06)', { city: 'X' }, 'INVALID_CITY'],
    ['UF inexistente (CA-08)', { state: 'XX' }, 'INVALID_STATE'],
    [
      'termos recusados (CA-09)',
      { acceptedTerms: false },
      'TERMS_NOT_ACCEPTED',
    ],
  ])('responde 422 para %s', async (_, overrides, code) => {
    const response = await signUp({ ...validBody, ...overrides });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toEqual({
      statusCode: 422,
      code,
      message: expect.any(String),
    });
    expect(testApp.database.users).toEqual([]);
    expect(testApp.mailer.sent).toEqual([]);
  });

  it.each([
    ['campo ausente', { name: undefined }],
    ['tipo errado', { acceptedTerms: 'true' }],
    ['campo não permitido', { photo: 'foto.png' }],
  ])('responde 422 VALIDATION_ERROR para %s', async (_, overrides) => {
    const response = await signUp({ ...validBody, ...overrides });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('responde 409 para o e-mail de uma conta ativa (CA-11)', async () => {
    testApp.database.insertUser({
      id: 'user-0',
      email: 'ana@exemplo.com',
      status: 'ACTIVE',
    });

    const response = await signUp(validBody);

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ code: 'EMAIL_ALREADY_REGISTERED' });
  });

  it('refaz o cadastro pendente depois de 60 segundos (CA-12)', async () => {
    await signUp(validBody);
    testApp.clock.advance({ seconds: 61 });

    const response = await signUp({
      ...validBody,
      city: 'Recife',
      state: 'PE',
    });

    expect(response.statusCode).toBe(201);
    expect(testApp.database.users).toHaveLength(1);
    expect(testApp.database.users[0]).toMatchObject({
      city: 'Recife',
      state: 'PE',
    });
    expect(
      testApp.database.verificationCodes.map(({ invalidatedAt }) =>
        invalidatedAt === null ? 'ativo' : 'invalidado',
      ),
    ).toEqual(['invalidado', 'ativo']);
    expect(testApp.mailer.sent).toHaveLength(2);
  });

  it('responde 429 ao refazer o cadastro antes de 60 segundos (CA-13)', async () => {
    await signUp(validBody);
    testApp.clock.advance({ seconds: 59 });

    const response = await signUp({ ...validBody, city: 'Recife' });

    expect(response.statusCode).toBe(429);
    expect(response.json()).toMatchObject({
      code: 'VERIFICATION_CODE_RESEND_TOO_SOON',
    });
    expect(testApp.database.users[0].city).toBe('São Paulo');
  });

  it('responde 201 mesmo com o SMTP falhando (CA-28)', async () => {
    testApp.mailer.failing = true;

    const response = await signUp(validBody);

    expect(response.statusCode).toBe(201);
    expect(testApp.database.users).toHaveLength(1);
  });

  it('não envia e-mail quando a transação falha (CA-29)', async () => {
    testApp.database.failNextWrite = true;

    const response = await signUp(validBody);

    expect(response.statusCode).toBe(500);
    expect(testApp.mailer.sent).toEqual([]);
  });

  it('responde 403 sem o header X-BookMatch-Client', async () => {
    const response = await testApp.request({
      method: 'POST',
      url: '/api/auth/sign-up',
      payload: validBody,
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({ code: 'CSRF_CHECK_FAILED' });
    expect(testApp.database.users).toEqual([]);
  });
});
