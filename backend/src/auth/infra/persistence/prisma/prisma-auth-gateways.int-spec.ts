import { validateEnvironment } from '../../../../config/environment.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { resetDatabase } from '../../../../../test/support/test-database.js';
import { TermsAcceptance } from '../../../application/entities/terms-acceptance.entity.js';
import { User } from '../../../application/entities/user.entity.js';
import {
  MAX_VERIFICATION_ATTEMPTS,
  VerificationCode,
} from '../../../application/entities/verification-code.entity.js';
import { BrazilianState } from '../../../application/entities/vo/brazilian-state.vo.js';
import { City } from '../../../application/entities/vo/city.vo.js';
import { Email } from '../../../application/entities/vo/email.vo.js';
import { PersonName } from '../../../application/entities/vo/person-name.vo.js';
import { EmailAlreadyRegisteredException } from '../../../application/exceptions/email-already-registered.exception.js';
import { InvalidVerificationCodeException } from '../../../application/exceptions/invalid-verification-code.exception.js';
import { PrismaCreateAccountGateway } from './prisma-create-account.gateway.js';
import { PrismaResendVerificationCodeGateway } from './prisma-resend-verification-code.gateway.js';
import { PrismaVerifyEmailGateway } from './prisma-verify-email.gateway.js';

const now = new Date('2026-11-16T10:00:00.000Z');

function minutesAfter(minutes: number): Date {
  return new Date(now.getTime() + minutes * 60_000);
}

function newUser(id = 'user-1', email = 'ana@exemplo.com'): User {
  return User.createAccount({
    id,
    name: PersonName.create('Ana Souza'),
    email: Email.create(email),
    passwordHash: 'hash',
    city: City.create('São Paulo'),
    state: BrazilianState.create('SP'),
    termsVersion: '1',
    now,
  });
}

function acceptance(userId: string, id = `terms-${userId}`, version = '1') {
  return TermsAcceptance.accept({ id, userId, termsVersion: version, now });
}

function code(id: string, userId: string, issuedAt: Date): VerificationCode {
  return VerificationCode.issue({
    id,
    userId,
    codeHash: id.padEnd(64, '0').slice(0, 64),
    previousIssuedAt: [],
    now: issuedAt,
  });
}

describe('Gateways Prisma de auth (integração)', () => {
  let prisma: PrismaService;
  let createAccount: PrismaCreateAccountGateway;
  let verifyEmail: PrismaVerifyEmailGateway;
  let resend: PrismaResendVerificationCodeGateway;

  beforeAll(() => {
    prisma = new PrismaService(validateEnvironment(process.env));
    createAccount = new PrismaCreateAccountGateway(prisma);
    verifyEmail = new PrismaVerifyEmailGateway(prisma);
    resend = new PrismaResendVerificationCodeGateway(prisma);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function storeAccount(user = newUser()) {
    await createAccount.createAccount({
      user,
      termsAcceptance: acceptance(user.id),
      verificationCode: code(`code-${user.id}`, user.id, now),
    });
    return user;
  }

  it('grava usuário, aceite e código e lê o usuário de volta (RN-07)', async () => {
    await storeAccount();

    const user = await createAccount.findUserByEmail(
      Email.create('ana@exemplo.com'),
    );

    expect(user?.id).toBe('user-1');
    expect(user?.status).toBe('PENDING_VERIFICATION');
    expect(user?.hasAcceptedTerms('1')).toBe(true);
    expect(await prisma.verificationCode.count()).toBe(1);
  });

  it('traduz o e-mail duplicado para EMAIL_ALREADY_REGISTERED e não grava nada (Fluxo D)', async () => {
    await storeAccount();

    await expect(
      storeAccount(newUser('user-2', 'ana@exemplo.com')),
    ).rejects.toThrow(EmailAlreadyRegisteredException);
    expect(await prisma.user.count()).toBe(1);
    expect(await prisma.termsAcceptance.count()).toBe(1);
    expect(await prisma.verificationCode.count()).toBe(1);
  });

  it('refaz o cadastro invalidando o código ativo e gravando o novo (RN-09, RN-15)', async () => {
    const user = await storeAccount();
    user.redoSignUp({
      name: PersonName.create('Ana Lima'),
      passwordHash: 'hash-2',
      city: City.create('Recife'),
      state: BrazilianState.create('PE'),
      termsVersion: '2',
    });

    await createAccount.redoSignUp({
      user,
      termsAcceptance: acceptance(user.id, 'terms-2', '2'),
      verificationCode: code('code-2', user.id, minutesAfter(2)),
    });

    const row = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(row).toMatchObject({
      name: 'Ana Lima',
      passwordHash: 'hash-2',
      city: 'Recife',
      state: 'PE',
    });
    const codes = await prisma.verificationCode.findMany({
      orderBy: { createdAt: 'asc' },
    });
    expect(codes.map(({ id, invalidatedAt }) => [id, invalidatedAt])).toEqual([
      [`code-${user.id}`, minutesAfter(2)],
      ['code-2', null],
    ]);
    expect(await prisma.termsAcceptance.count()).toBe(2);
  });

  it('recusa refazer o cadastro de uma conta que foi ativada (RN-08)', async () => {
    const user = await storeAccount();
    await prisma.user.update({
      where: { id: user.id },
      data: { status: 'ACTIVE' },
    });

    await expect(
      createAccount.redoSignUp({
        user,
        termsAcceptance: null,
        verificationCode: code('code-2', user.id, minutesAfter(2)),
      }),
    ).rejects.toThrow(EmailAlreadyRegisteredException);
    expect(await prisma.verificationCode.count()).toBe(1);
  });

  it('lista as datas de envio, inclusive de códigos invalidados e consumidos (RN-17)', async () => {
    const user = await storeAccount();
    await resend.replaceVerificationCode(
      code('code-2', user.id, minutesAfter(5)),
    );
    await prisma.verificationCode.update({
      where: { id: 'code-2' },
      data: { consumedAt: minutesAfter(6) },
    });

    expect(
      await resend.listVerificationCodeIssueDates(user.id, minutesAfter(-1)),
    ).toEqual(expect.arrayContaining([now, minutesAfter(5)]));
    expect(await resend.listVerificationCodeIssueDates(user.id, now)).toEqual([
      minutesAfter(5),
    ]);
  });

  it('encontra só o código ativo mais recente (RN-15)', async () => {
    const user = await storeAccount();
    await resend.replaceVerificationCode(
      code('code-2', user.id, minutesAfter(1)),
    );

    const active = await verifyEmail.findActiveVerificationCode(user.id);

    expect(active?.id).toBe('code-2');
    expect(
      await prisma.verificationCode.count({ where: { invalidatedAt: null } }),
    ).toBe(1);
  });

  it('não passa de 5 tentativas com erros simultâneos (RN-14)', async () => {
    const user = await storeAccount();

    await Promise.all(
      Array.from({ length: 8 }, () =>
        verifyEmail.registerFailedAttempt(`code-${user.id}`),
      ),
    );

    const row = await prisma.verificationCode.findUniqueOrThrow({
      where: { id: `code-${user.id}` },
    });
    expect(row.attempts).toBe(MAX_VERIFICATION_ATTEMPTS);
  });

  it('consome o código e ativa o usuário numa transação (RN-18)', async () => {
    const user = await storeAccount();
    const active = await verifyEmail.findActiveVerificationCode(user.id);
    active?.consume(minutesAfter(3));
    user.verifyEmail();

    await verifyEmail.confirmEmail({ user, verificationCode: active! });

    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).status,
    ).toBe('ACTIVE');
    expect(
      (
        await prisma.verificationCode.findUniqueOrThrow({
          where: { id: active!.id },
        })
      ).consumedAt,
    ).toEqual(minutesAfter(3));
  });

  it('não ativa o usuário se o código foi invalidado durante a conferência', async () => {
    const user = await storeAccount();
    const active = await verifyEmail.findActiveVerificationCode(user.id);
    await resend.replaceVerificationCode(
      code('code-2', user.id, minutesAfter(1)),
    );
    active?.consume(minutesAfter(2));
    user.verifyEmail();

    await expect(
      verifyEmail.confirmEmail({ user, verificationCode: active! }),
    ).rejects.toThrow(InvalidVerificationCodeException);
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).status,
    ).toBe('PENDING_VERIFICATION');
  });
});
