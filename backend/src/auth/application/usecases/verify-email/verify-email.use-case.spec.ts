import { FixedClock } from '../../../../shared/testing/fixed-clock.js';
import { FakeVerificationCodeHasher } from '../../../testing/fake-verification-code-hasher.js';
import { InMemoryAuthDatabase } from '../../../testing/in-memory-auth-database.js';
import { EmailAlreadyVerifiedException } from '../../exceptions/email-already-verified.exception.js';
import { InvalidVerificationCodeException } from '../../exceptions/invalid-verification-code.exception.js';
import { VerificationCodeAttemptsExceededException } from '../../exceptions/verification-code-attempts-exceeded.exception.js';
import { VerificationCodeExpiredException } from '../../exceptions/verification-code-expired.exception.js';
import { VerifyEmailUseCase } from './verify-email.use-case.js';

const createdAt = new Date('2026-11-16T10:00:00.000Z');

function setup() {
  const database = new InMemoryAuthDatabase();
  const clock = new FixedClock(createdAt);
  const useCase = new VerifyEmailUseCase({
    gateway: database,
    codeHasher: new FakeVerificationCodeHasher(),
    clock,
  });
  database.insertUser({ id: 'user-1', email: 'ana@exemplo.com' });
  const code = database.insertVerificationCode({
    id: 'code-1',
    userId: 'user-1',
    codeHash: 'hmac:042317',
    createdAt,
  });
  clock.advance({ minutes: 5 });

  return { database, clock, code, useCase };
}

describe('VerifyEmailUseCase', () => {
  it('consome o código e ativa a conta (CA-16)', async () => {
    const { database, clock, code, useCase } = setup();

    await useCase.execute({ email: 'ana@exemplo.com', code: '042317' });

    expect(database.userByEmail('ana@exemplo.com')?.status).toBe('ACTIVE');
    expect(code.consumedAt).toEqual(clock.now());
  });

  it('normaliza o e-mail informado (RN-02)', async () => {
    const { database, useCase } = setup();

    await useCase.execute({ email: '  ANA@exemplo.com ', code: '042317' });

    expect(database.userByEmail('ana@exemplo.com')?.status).toBe('ACTIVE');
  });

  it('aceita o código no último instante da validade', async () => {
    const { database, clock, useCase } = setup();
    clock.set(new Date('2026-11-16T10:15:00.000Z'));

    await useCase.execute({ email: 'ana@exemplo.com', code: '042317' });

    expect(database.userByEmail('ana@exemplo.com')?.status).toBe('ACTIVE');
  });

  it('recusa o código expirado e mantém a conta pendente (CA-17)', async () => {
    const { database, clock, useCase } = setup();
    clock.set(new Date('2026-11-16T10:15:01.000Z'));

    await expect(
      useCase.execute({ email: 'ana@exemplo.com', code: '042317' }),
    ).rejects.toThrow(VerificationCodeExpiredException);
    expect(database.userByEmail('ana@exemplo.com')?.status).toBe(
      'PENDING_VERIFICATION',
    );
  });

  it('soma uma tentativa quando o código não confere (CA-18)', async () => {
    const { code, useCase } = setup();

    await expect(
      useCase.execute({ email: 'ana@exemplo.com', code: '000000' }),
    ).rejects.toThrow(InvalidVerificationCodeException);
    expect(code.attempts).toBe(1);
  });

  it('bloqueia o código na quinta tentativa errada (RN-14)', async () => {
    const { code, useCase } = setup();

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      await expect(
        useCase.execute({ email: 'ana@exemplo.com', code: '000000' }),
      ).rejects.toThrow(InvalidVerificationCodeException);
    }

    expect(code.attempts).toBe(5);
    await expect(
      useCase.execute({ email: 'ana@exemplo.com', code: '000000' }),
    ).rejects.toThrow(VerificationCodeAttemptsExceededException);
    expect(code.attempts).toBe(5);
  });

  it('recusa até o código certo depois de 5 tentativas erradas (CA-19)', async () => {
    const { database, code, useCase } = setup();
    code.attempts = 5;

    await expect(
      useCase.execute({ email: 'ana@exemplo.com', code: '042317' }),
    ).rejects.toThrow(VerificationCodeAttemptsExceededException);
    expect(database.userByEmail('ana@exemplo.com')?.status).toBe(
      'PENDING_VERIFICATION',
    );
  });

  it('só aceita o código mais recente (CA-20)', async () => {
    const { database, clock, code, useCase } = setup();
    code.invalidatedAt = clock.now();
    database.insertVerificationCode({
      id: 'code-2',
      userId: 'user-1',
      codeHash: 'hmac:987654',
      createdAt: clock.now(),
    });

    await expect(
      useCase.execute({ email: 'ana@exemplo.com', code: '042317' }),
    ).rejects.toThrow(InvalidVerificationCodeException);
    await useCase.execute({ email: 'ana@exemplo.com', code: '987654' });

    expect(database.userByEmail('ana@exemplo.com')?.status).toBe('ACTIVE');
  });

  it('responde como código inválido para um e-mail sem cadastro (CA-21)', async () => {
    const { useCase } = setup();

    await expect(
      useCase.execute({ email: 'bia@exemplo.com', code: '042317' }),
    ).rejects.toThrow(InvalidVerificationCodeException);
  });

  it('responde como código inválido quando não há código ativo', async () => {
    const { clock, code, useCase } = setup();
    code.consumedAt = clock.now();

    await expect(
      useCase.execute({ email: 'ana@exemplo.com', code: '042317' }),
    ).rejects.toThrow(InvalidVerificationCodeException);
  });

  it('recusa a verificação de uma conta já ativa (CA-22)', async () => {
    const { database, useCase } = setup();
    database.insertUser({
      id: 'user-2',
      email: 'bia@exemplo.com',
      status: 'ACTIVE',
    });

    await expect(
      useCase.execute({ email: 'bia@exemplo.com', code: '042317' }),
    ).rejects.toThrow(EmailAlreadyVerifiedException);
  });

  it('recusa quando o código deixa de estar ativo durante a conferência', async () => {
    const { database, code, useCase } = setup();
    const confirmEmail = database.confirmEmail.bind(database);
    database.confirmEmail = async (data) => {
      code.invalidatedAt = new Date();
      return confirmEmail(data);
    };

    await expect(
      useCase.execute({ email: 'ana@exemplo.com', code: '042317' }),
    ).rejects.toThrow(InvalidVerificationCodeException);
    expect(database.userByEmail('ana@exemplo.com')?.status).toBe(
      'PENDING_VERIFICATION',
    );
  });
});
