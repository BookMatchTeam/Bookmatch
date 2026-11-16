import {
  createAuthTestApp,
  type AuthTestApp,
} from '../support/auth-test-app.js';
import { webClientHeaders } from '../support/test-app.js';

describe('POST /api/auth/email-verification/resend (e2e)', () => {
  let testApp: AuthTestApp;

  beforeEach(async () => {
    testApp = await createAuthTestApp();
    await testApp.request({
      method: 'POST',
      url: '/api/auth/sign-up',
      headers: webClientHeaders,
      payload: {
        name: 'Ana Souza',
        email: 'ana@exemplo.com',
        password: 'senha1234',
        city: 'São Paulo',
        state: 'SP',
        acceptedTerms: true,
      },
    });
  });

  afterEach(async () => {
    await testApp.app.close();
  });

  function resend(payload: object) {
    return testApp.request({
      method: 'POST',
      url: '/api/auth/email-verification/resend',
      headers: webClientHeaders,
      payload,
    });
  }

  it('invalida o código anterior e envia um novo (CA-23)', async () => {
    testApp.clock.advance({ seconds: 61 });

    const response = await resend({ email: 'ana@exemplo.com' });

    expect(response.statusCode).toBe(204);
    expect(
      testApp.database.verificationCodes.map(({ invalidatedAt }) =>
        invalidatedAt === null ? 'ativo' : 'invalidado',
      ),
    ).toEqual(['invalidado', 'ativo']);
    expect(testApp.mailer.sent).toHaveLength(2);
  });

  it('responde 429 com 59 segundos desde o último envio (CA-24)', async () => {
    testApp.clock.advance({ seconds: 59 });

    const response = await resend({ email: 'ana@exemplo.com' });

    expect(response.statusCode).toBe(429);
    expect(response.json()).toEqual({
      statusCode: 429,
      code: 'VERIFICATION_CODE_RESEND_TOO_SOON',
      message: expect.any(String),
    });
  });

  it('responde 429 com 5 envios em 60 minutos e libera depois (CA-25, CA-26)', async () => {
    for (let resent = 0; resent < 4; resent += 1) {
      testApp.clock.advance({ minutes: 10 });
      expect((await resend({ email: 'ana@exemplo.com' })).statusCode).toBe(204);
    }
    testApp.clock.advance({ minutes: 10 });

    const blocked = await resend({ email: 'ana@exemplo.com' });
    testApp.clock.advance({ minutes: 10, seconds: 1 });
    const allowed = await resend({ email: 'ana@exemplo.com' });

    expect(blocked.statusCode).toBe(429);
    expect(blocked.json()).toMatchObject({
      code: 'VERIFICATION_CODE_SEND_LIMIT_REACHED',
    });
    expect(allowed.statusCode).toBe(204);
    expect(testApp.mailer.sent).toHaveLength(6);
  });

  it.each(['bia@exemplo.com', 'nao-e-email'])(
    'responde 204 sem enviar nada para %j, sem cadastro (CA-27)',
    async (email) => {
      testApp.clock.advance({ minutes: 2 });

      const response = await resend({ email });

      expect(response.statusCode).toBe(204);
      expect(testApp.mailer.sent).toHaveLength(1);
    },
  );

  it('responde 204 sem enviar nada para conta ativa (CA-27)', async () => {
    testApp.database.users[0].status = 'ACTIVE';
    testApp.clock.advance({ minutes: 2 });

    const response = await resend({ email: 'ana@exemplo.com' });

    expect(response.statusCode).toBe(204);
    expect(testApp.mailer.sent).toHaveLength(1);
  });

  it('responde 422 VALIDATION_ERROR sem o e-mail', async () => {
    const response = await resend({});

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});
