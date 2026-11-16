import { FixedClock } from '../../../../shared/testing/fixed-clock.js';
import { FixedIdGenerator } from '../../../../shared/testing/fixed-id-generator.js';
import { FakeVerificationCodeHasher } from '../../../testing/fake-verification-code-hasher.js';
import { FakeVerificationCodeMailer } from '../../../testing/fake-verification-code-mailer.js';
import { InMemoryAuthDatabase } from '../../../testing/in-memory-auth-database.js';
import { SequenceVerificationCodeGenerator } from '../../../testing/sequence-verification-code-generator.js';
import { VerificationCodeResendTooSoonException } from '../../exceptions/verification-code-resend-too-soon.exception.js';
import { VerificationCodeSendLimitReachedException } from '../../exceptions/verification-code-send-limit-reached.exception.js';
import { ResendVerificationCodeUseCase } from './resend-verification-code.use-case.js';

const now = new Date('2026-11-16T10:00:00.000Z');

function secondsBefore(seconds: number): Date {
  return new Date(now.getTime() - seconds * 1_000);
}

function setup(sentSecondsAgo: number[] = [61]) {
  const database = new InMemoryAuthDatabase();
  const mailer = new FakeVerificationCodeMailer();
  const useCase = new ResendVerificationCodeUseCase({
    gateway: database,
    codeGenerator: new SequenceVerificationCodeGenerator('987654'),
    codeHasher: new FakeVerificationCodeHasher(),
    mailer,
    idGenerator: new FixedIdGenerator('code-new'),
    clock: new FixedClock(now),
  });
  database.insertUser({ id: 'user-1', email: 'ana@exemplo.com' });
  for (const [index, seconds] of sentSecondsAgo.entries()) {
    database.insertVerificationCode({
      id: `code-${index}`,
      userId: 'user-1',
      codeHash: `hmac:${index}`,
      createdAt: secondsBefore(seconds),
      invalidatedAt: index < sentSecondsAgo.length - 1 ? now : null,
    });
  }

  return { database, mailer, useCase };
}

describe('ResendVerificationCodeUseCase', () => {
  it('invalida o código anterior e envia um novo (CA-23)', async () => {
    const { database, mailer, useCase } = setup([61]);

    await useCase.execute({ email: 'ana@exemplo.com' });

    expect(database.codesOf('user-1')).toEqual([
      expect.objectContaining({ id: 'code-0', invalidatedAt: now }),
      expect.objectContaining({
        id: 'code-new',
        codeHash: 'hmac:987654',
        createdAt: now,
        expiresAt: new Date('2026-11-16T10:15:00.000Z'),
        invalidatedAt: null,
      }),
    ]);
    expect(mailer.sent).toEqual([{ to: 'ana@exemplo.com', code: '987654' }]);
  });

  it('normaliza o e-mail informado (RN-02)', async () => {
    const { mailer, useCase } = setup([61]);

    await useCase.execute({ email: ' Ana@Exemplo.com ' });

    expect(mailer.sent).toEqual([{ to: 'ana@exemplo.com', code: '987654' }]);
  });

  it('recusa com 59 segundos desde o último envio (CA-24)', async () => {
    const { database, mailer, useCase } = setup([59]);

    await expect(useCase.execute({ email: 'ana@exemplo.com' })).rejects.toThrow(
      VerificationCodeResendTooSoonException,
    );
    expect(database.codesOf('user-1')).toHaveLength(1);
    expect(mailer.sent).toEqual([]);
  });

  it('recusa com 5 envios nos últimos 60 minutos (CA-25)', async () => {
    const { mailer, useCase } = setup([3_000, 2_000, 1_000, 500, 120]);

    await expect(useCase.execute({ email: 'ana@exemplo.com' })).rejects.toThrow(
      VerificationCodeSendLimitReachedException,
    );
    expect(mailer.sent).toEqual([]);
  });

  it('envia quando o primeiro de 5 envios foi há 61 minutos (CA-26)', async () => {
    const { mailer, useCase } = setup([3_660, 2_000, 1_000, 500, 120]);

    await useCase.execute({ email: 'ana@exemplo.com' });

    expect(mailer.sent).toHaveLength(1);
  });

  it('conta códigos já consumidos e invalidados no limite (RN-17)', async () => {
    const { database, useCase } = setup([3_000, 2_000, 1_000, 500, 120]);
    database.codesOf('user-1')[0].consumedAt = now;

    await expect(useCase.execute({ email: 'ana@exemplo.com' })).rejects.toThrow(
      VerificationCodeSendLimitReachedException,
    );
  });

  it.each([
    ['sem cadastro', 'bia@exemplo.com'],
    ['de conta ativa', 'carla@exemplo.com'],
  ])(
    'responde sucesso para e-mail %s sem enviar nada (CA-27)',
    async (_, email) => {
      const { database, mailer, useCase } = setup();
      database.insertUser({
        id: 'user-2',
        email: 'carla@exemplo.com',
        status: 'ACTIVE',
      });

      await expect(useCase.execute({ email })).resolves.toBeUndefined();
      expect(mailer.sent).toEqual([]);
      expect(database.codesOf('user-2')).toEqual([]);
    },
  );

  it('responde normalmente quando o envio do e-mail falha (RN-19)', async () => {
    const { database, mailer, useCase } = setup([61]);
    mailer.failing = true;

    await expect(
      useCase.execute({ email: 'ana@exemplo.com' }),
    ).resolves.toBeUndefined();
    expect(database.codesOf('user-1')).toHaveLength(2);
  });

  it('não envia e-mail quando a transação falha (RN-19)', async () => {
    const { database, mailer, useCase } = setup([61]);
    database.failNextWrite = true;

    await expect(useCase.execute({ email: 'ana@exemplo.com' })).rejects.toThrow(
      'Falha simulada na transação',
    );
    expect(mailer.sent).toEqual([]);
  });
});
