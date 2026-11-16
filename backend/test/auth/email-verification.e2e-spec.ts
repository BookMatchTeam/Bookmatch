import {
  createAuthTestApp,
  type AuthTestApp,
} from '../support/auth-test-app.js';
import { webClientHeaders } from '../support/test-app.js';

describe('POST /api/auth/email-verification (e2e)', () => {
  let testApp: AuthTestApp;
  let code: string;

  beforeEach(async () => {
    testApp = await createAuthTestApp();
    await testApp.request({
      method: 'POST',
      url: '/api/auth/sign-up',
      headers: webClientHeaders,
      payload: {
        name: 'Ana Souza',
        email: 'ana@exemplo.com',
        password: 'Senha@1234',
        city: 'São Paulo',
        state: 'SP',
        acceptedTerms: true,
      },
    });
    code = testApp.mailer.lastCodeSentTo('ana@exemplo.com') ?? '';
  });

  afterEach(async () => {
    await testApp.app.close();
  });

  function verifyEmail(payload: object) {
    return testApp.request({
      method: 'POST',
      url: '/api/auth/email-verification',
      headers: webClientHeaders,
      payload,
    });
  }

  function wrongCode(): string {
    return code === '000000' ? '000001' : '000000';
  }

  it('ativa a conta com o código certo (CA-16)', async () => {
    const response = await verifyEmail({ email: 'ana@exemplo.com', code });

    expect(response.statusCode).toBe(204);
    expect(response.payload).toBe('');
    expect(testApp.database.userByEmail('ana@exemplo.com')?.status).toBe(
      'ACTIVE',
    );
    expect(testApp.database.verificationCodes[0].consumedAt).toEqual(
      testApp.clock.now(),
    );
  });

  it('responde 422 VERIFICATION_CODE_EXPIRED depois de 15 minutos (CA-17)', async () => {
    testApp.clock.advance({ minutes: 15, seconds: 1 });

    const response = await verifyEmail({ email: 'ana@exemplo.com', code });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({
      code: 'VERIFICATION_CODE_EXPIRED',
    });
    expect(testApp.database.userByEmail('ana@exemplo.com')?.status).toBe(
      'PENDING_VERIFICATION',
    );
  });

  it('soma uma tentativa com o código errado (CA-18)', async () => {
    const response = await verifyEmail({
      email: 'ana@exemplo.com',
      code: wrongCode(),
    });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({
      code: 'INVALID_VERIFICATION_CODE',
    });
    expect(testApp.database.verificationCodes[0].attempts).toBe(1);
  });

  it('bloqueia o código depois de 5 tentativas erradas (CA-19)', async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await verifyEmail({ email: 'ana@exemplo.com', code: wrongCode() });
    }

    const response = await verifyEmail({ email: 'ana@exemplo.com', code });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({
      code: 'VERIFICATION_CODE_ATTEMPTS_EXCEEDED',
    });
    expect(testApp.database.userByEmail('ana@exemplo.com')?.status).toBe(
      'PENDING_VERIFICATION',
    );
  });

  it('só aceita o código mais recente (CA-20)', async () => {
    testApp.clock.advance({ seconds: 60 });
    await testApp.request({
      method: 'POST',
      url: '/api/auth/email-verification/resend',
      headers: webClientHeaders,
      payload: { email: 'ana@exemplo.com' },
    });
    const newCode = testApp.mailer.lastCodeSentTo('ana@exemplo.com') ?? '';

    const withOldCode = await verifyEmail({ email: 'ana@exemplo.com', code });
    const withNewCode = await verifyEmail({
      email: 'ana@exemplo.com',
      code: newCode,
    });

    expect(withOldCode.json()).toMatchObject({
      code: 'INVALID_VERIFICATION_CODE',
    });
    expect(withNewCode.statusCode).toBe(204);
  });

  it('responde código inválido para e-mail sem cadastro (CA-21)', async () => {
    const response = await verifyEmail({ email: 'bia@exemplo.com', code });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({
      code: 'INVALID_VERIFICATION_CODE',
    });
  });

  it('responde 409 EMAIL_ALREADY_VERIFIED para conta ativa (CA-22)', async () => {
    await verifyEmail({ email: 'ana@exemplo.com', code });

    const response = await verifyEmail({ email: 'ana@exemplo.com', code });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ code: 'EMAIL_ALREADY_VERIFIED' });
  });

  it.each(['12345', '1234567', 'abcdef', 123456])(
    'responde VALIDATION_ERROR sem contar tentativa para o código %j',
    async (invalidCode) => {
      const response = await verifyEmail({
        email: 'ana@exemplo.com',
        code: invalidCode,
      });

      expect(response.statusCode).toBe(422);
      expect(response.json()).toMatchObject({ code: 'VALIDATION_ERROR' });
      expect(testApp.database.verificationCodes[0].attempts).toBe(0);
    },
  );
});
