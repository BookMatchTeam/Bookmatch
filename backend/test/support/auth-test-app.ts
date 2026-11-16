import {
  CREATE_ACCOUNT_GATEWAY,
  RESEND_VERIFICATION_CODE_GATEWAY,
  VERIFICATION_CODE_MAILER,
  VERIFY_EMAIL_GATEWAY,
} from '../../src/auth/infra/auth.tokens.js';
import { FakeVerificationCodeMailer } from '../../src/auth/testing/fake-verification-code-mailer.js';
import { InMemoryAuthDatabase } from '../../src/auth/testing/in-memory-auth-database.js';
import { CLOCK } from '../../src/shared/infra/shared.module.js';
import { FixedClock } from '../../src/shared/testing/fixed-clock.js';
import { createTestApp, type TestApp } from './test-app.js';

export interface AuthTestApp extends TestApp {
  readonly database: InMemoryAuthDatabase;
  readonly mailer: FakeVerificationCodeMailer;
  readonly clock: FixedClock;
}

/**
 * Aplicação completa com o banco de `auth` em memória, o envio de e-mail
 * falso e um relógio controlado pelo teste. Hash de senha e HMAC são reais.
 */
export async function createAuthTestApp(): Promise<AuthTestApp> {
  const database = new InMemoryAuthDatabase();
  const mailer = new FakeVerificationCodeMailer();
  const clock = new FixedClock(new Date('2026-11-16T10:00:00.000Z'));
  const testApp = await createTestApp({
    overrides: [
      { provide: CREATE_ACCOUNT_GATEWAY, useValue: database },
      { provide: VERIFY_EMAIL_GATEWAY, useValue: database },
      { provide: RESEND_VERIFICATION_CODE_GATEWAY, useValue: database },
      { provide: VERIFICATION_CODE_MAILER, useValue: mailer },
      { provide: CLOCK, useValue: clock },
    ],
  });

  return { ...testApp, database, mailer, clock };
}
