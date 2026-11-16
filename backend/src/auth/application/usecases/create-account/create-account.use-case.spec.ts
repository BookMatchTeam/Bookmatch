import { FixedClock } from '../../../../shared/testing/fixed-clock.js';
import { FixedIdGenerator } from '../../../../shared/testing/fixed-id-generator.js';
import { FakePasswordHasher } from '../../../testing/fake-password-hasher.js';
import { FakeVerificationCodeHasher } from '../../../testing/fake-verification-code-hasher.js';
import { FakeVerificationCodeMailer } from '../../../testing/fake-verification-code-mailer.js';
import { InMemoryAuthDatabase } from '../../../testing/in-memory-auth-database.js';
import { SequenceVerificationCodeGenerator } from '../../../testing/sequence-verification-code-generator.js';
import { EmailAlreadyRegisteredException } from '../../exceptions/email-already-registered.exception.js';
import { InvalidCityException } from '../../exceptions/invalid-city.exception.js';
import { InvalidEmailException } from '../../exceptions/invalid-email.exception.js';
import { InvalidNameException } from '../../exceptions/invalid-name.exception.js';
import { InvalidPasswordException } from '../../exceptions/invalid-password.exception.js';
import { InvalidStateException } from '../../exceptions/invalid-state.exception.js';
import { TermsNotAcceptedException } from '../../exceptions/terms-not-accepted.exception.js';
import { VerificationCodeResendTooSoonException } from '../../exceptions/verification-code-resend-too-soon.exception.js';
import { VerificationCodeSendLimitReachedException } from '../../exceptions/verification-code-send-limit-reached.exception.js';
import type { CreateAccountInput } from './create-account.input.js';
import { CreateAccountUseCase } from './create-account.use-case.js';

const now = new Date('2026-11-16T10:00:00.000Z');

const validInput: CreateAccountInput = {
  name: 'Ana Souza',
  email: 'ana@exemplo.com',
  password: 'Senha@1234',
  city: 'São Paulo',
  state: 'SP',
  acceptedTerms: true,
};

function setup(ids: string[] = ['user-1', 'terms-1', 'code-1']) {
  const database = new InMemoryAuthDatabase();
  const mailer = new FakeVerificationCodeMailer();
  const clock = new FixedClock(now);
  const useCase = new CreateAccountUseCase({
    gateway: database,
    passwordHasher: new FakePasswordHasher(),
    codeGenerator: new SequenceVerificationCodeGenerator('042317', '987654'),
    codeHasher: new FakeVerificationCodeHasher(),
    mailer,
    idGenerator: new FixedIdGenerator(...ids),
    clock,
    termsVersion: '1',
  });

  return { database, mailer, clock, useCase };
}

function secondsBefore(seconds: number): Date {
  return new Date(now.getTime() - seconds * 1_000);
}

describe('CreateAccountUseCase', () => {
  it('cria a conta pendente com aceite e código, e envia o e-mail (CA-01)', async () => {
    const { database, mailer, useCase } = setup();

    const output = await useCase.execute(validInput);

    expect(output).toEqual({ email: 'ana@exemplo.com' });
    expect(database.users).toEqual([
      {
        id: 'user-1',
        name: 'Ana Souza',
        email: 'ana@exemplo.com',
        passwordHash: 'hashed:Senha@1234',
        city: 'São Paulo',
        state: 'SP',
        status: 'PENDING_VERIFICATION',
        createdAt: now,
      },
    ]);
    expect(database.verificationCodes).toEqual([
      {
        id: 'code-1',
        userId: 'user-1',
        purpose: 'EMAIL_VERIFICATION',
        codeHash: 'hmac:042317',
        attempts: 0,
        expiresAt: new Date('2026-11-16T10:15:00.000Z'),
        consumedAt: null,
        invalidatedAt: null,
        createdAt: now,
      },
    ]);
    expect(mailer.sent).toEqual([{ to: 'ana@exemplo.com', code: '042317' }]);
  });

  it('grava a versão vigente dos termos e o horário do Clock (CA-10)', async () => {
    const { database, useCase } = setup();

    await useCase.execute(validInput);

    expect(database.termsAcceptances).toEqual([
      { id: 'terms-1', userId: 'user-1', termsVersion: '1', acceptedAt: now },
    ]);
  });

  it('normaliza nome, e-mail, cidade e UF (CA-03, CA-07)', async () => {
    const { database, mailer, useCase } = setup();

    const output = await useCase.execute({
      ...validInput,
      name: '  Ana Souza ',
      email: '  Ana@Exemplo.COM ',
      city: ' São Paulo  ',
      state: 'sp',
    });

    expect(output.email).toBe('ana@exemplo.com');
    expect(database.users[0]).toMatchObject({
      name: 'Ana Souza',
      email: 'ana@exemplo.com',
      city: 'São Paulo',
      state: 'SP',
    });
    expect(mailer.sent[0].to).toBe('ana@exemplo.com');
  });

  it('não guarda a senha em texto puro (CA-14)', async () => {
    const { database, useCase } = setup();

    await useCase.execute(validInput);

    expect(JSON.stringify(database.users)).not.toContain('"Senha@1234"');
  });

  it.each([
    ['nome curto', { name: ' A ' }, InvalidNameException],
    ['nome longo', { name: 'x'.repeat(101) }, InvalidNameException],
    ['e-mail inválido', { email: 'ana@' }, InvalidEmailException],
    [
      'senha sem maiúscula',
      { password: 'senha@1234' },
      InvalidPasswordException,
    ],
    ['senha sem especial', { password: 'Senha1234' }, InvalidPasswordException],
    ['senha sem número', { password: 'Senha@abcd' }, InvalidPasswordException],
    ['senha curta', { password: 'Sen@1' }, InvalidPasswordException],
    ['cidade curta', { city: 'X' }, InvalidCityException],
    ['UF inexistente', { state: 'XX' }, InvalidStateException],
    ['termos não aceitos', { acceptedTerms: false }, TermsNotAcceptedException],
  ])(
    'recusa %s sem gravar nem enviar nada (CA-02, CA-04 a CA-06, CA-08, CA-09)',
    async (_, overrides, exception) => {
      const { database, mailer, useCase } = setup();

      await expect(
        useCase.execute({ ...validInput, ...overrides }),
      ).rejects.toThrow(exception);
      expect(database.users).toEqual([]);
      expect(database.verificationCodes).toEqual([]);
      expect(mailer.sent).toEqual([]);
    },
  );

  it('recusa o e-mail de uma conta ativa sem alterar nada (CA-11)', async () => {
    const { database, mailer, useCase } = setup();
    const existing = database.insertUser({
      id: 'user-0',
      email: 'ana@exemplo.com',
      status: 'ACTIVE',
    });
    const before = structuredClone(database.users);

    await expect(
      useCase.execute({ ...validInput, email: 'ANA@exemplo.com' }),
    ).rejects.toThrow(EmailAlreadyRegisteredException);
    expect(database.users).toEqual(before);
    expect(database.codesOf(existing.id)).toEqual([]);
    expect(mailer.sent).toEqual([]);
  });

  describe('conta pendente com o mesmo e-mail (RN-09)', () => {
    function setupPending(lastSentSecondsAgo: number) {
      const context = setup(['code-1']);
      context.database.insertUser({
        id: 'user-0',
        email: 'ana@exemplo.com',
        name: 'Nome Antigo',
        passwordHash: 'hash-antigo',
        city: 'Recife',
        state: 'PE',
      });
      context.database.insertVerificationCode({
        id: 'code-0',
        userId: 'user-0',
        codeHash: 'hmac:111111',
        createdAt: secondsBefore(lastSentSecondsAgo),
      });

      return context;
    }

    it('substitui os dados, invalida o código anterior e envia um novo (CA-12)', async () => {
      const { database, mailer, useCase } = setupPending(61);

      const output = await useCase.execute(validInput);

      expect(output).toEqual({ email: 'ana@exemplo.com' });
      expect(database.users).toEqual([
        expect.objectContaining({
          id: 'user-0',
          name: 'Ana Souza',
          passwordHash: 'hashed:Senha@1234',
          city: 'São Paulo',
          state: 'SP',
          status: 'PENDING_VERIFICATION',
        }),
      ]);
      expect(database.codesOf('user-0')).toEqual([
        expect.objectContaining({ id: 'code-0', invalidatedAt: now }),
        expect.objectContaining({
          id: 'code-1',
          codeHash: 'hmac:042317',
          invalidatedAt: null,
        }),
      ]);
      expect(mailer.sent).toEqual([{ to: 'ana@exemplo.com', code: '042317' }]);
    });

    it('não duplica o aceite da versão vigente já aceita', async () => {
      const { database, useCase } = setupPending(61);

      await useCase.execute(validInput);

      expect(
        database.termsAcceptances.filter(({ userId }) => userId === 'user-0'),
      ).toHaveLength(1);
    });

    it('registra o aceite de uma versão nova dos termos', async () => {
      const { database, mailer } = setupPending(61);
      const useCase = new CreateAccountUseCase({
        gateway: database,
        passwordHasher: new FakePasswordHasher(),
        codeGenerator: new SequenceVerificationCodeGenerator('042317'),
        codeHasher: new FakeVerificationCodeHasher(),
        mailer,
        idGenerator: new FixedIdGenerator('terms-2', 'code-1'),
        clock: new FixedClock(now),
        termsVersion: '2',
      });

      await useCase.execute(validInput);

      expect(
        database.termsAcceptances.filter(({ userId }) => userId === 'user-0'),
      ).toEqual([
        expect.objectContaining({ termsVersion: '1' }),
        { id: 'terms-2', userId: 'user-0', termsVersion: '2', acceptedAt: now },
      ]);
    });

    it('recusa com menos de 60 segundos do último envio, sem alterar nada (CA-13)', async () => {
      const { database, mailer, useCase } = setupPending(59);
      const before = structuredClone({
        users: database.users,
        codes: database.verificationCodes,
      });

      await expect(useCase.execute(validInput)).rejects.toThrow(
        VerificationCodeResendTooSoonException,
      );
      expect({
        users: database.users,
        codes: database.verificationCodes,
      }).toEqual(before);
      expect(mailer.sent).toEqual([]);
    });

    it('recusa depois de 5 envios em 60 minutos (RN-17)', async () => {
      const { database, useCase } = setupPending(3_000);
      for (const [index, seconds] of [2_000, 1_000, 500, 120].entries()) {
        database.insertVerificationCode({
          id: `code-extra-${index}`,
          userId: 'user-0',
          codeHash: 'hmac:x',
          createdAt: secondsBefore(seconds),
        });
      }

      await expect(useCase.execute(validInput)).rejects.toThrow(
        VerificationCodeSendLimitReachedException,
      );
    });
  });

  it('responde normalmente quando o envio do e-mail falha (CA-28)', async () => {
    const { database, mailer, useCase } = setup();
    mailer.failing = true;

    await expect(useCase.execute(validInput)).resolves.toEqual({
      email: 'ana@exemplo.com',
    });
    expect(database.users).toHaveLength(1);
  });

  it('não envia e-mail quando a transação falha (CA-29)', async () => {
    const { database, mailer, useCase } = setup();
    database.failNextWrite = true;

    await expect(useCase.execute(validInput)).rejects.toThrow(
      'Falha simulada na transação',
    );
    expect(mailer.sent).toEqual([]);
  });

  it('traduz o cadastro simultâneo do mesmo e-mail para conflito (Fluxo D)', async () => {
    const { database, mailer, useCase } = setup();
    const createAccount = database.createAccount.bind(database);
    database.createAccount = async (data) => {
      database.insertUser({ id: 'user-concorrente', email: 'ana@exemplo.com' });
      return createAccount(data);
    };

    await expect(useCase.execute(validInput)).rejects.toThrow(
      EmailAlreadyRegisteredException,
    );
    expect(mailer.sent).toEqual([]);
  });
});
