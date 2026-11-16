import { EmailAlreadyRegisteredException } from '../application/exceptions/email-already-registered.exception.js';
import { InvalidVerificationCodeException } from '../application/exceptions/invalid-verification-code.exception.js';
import type { TermsAcceptance } from '../application/entities/terms-acceptance.entity.js';
import { User, type UserStatus } from '../application/entities/user.entity.js';
import {
  MAX_VERIFICATION_ATTEMPTS,
  VerificationCode,
  type VerificationPurpose,
} from '../application/entities/verification-code.entity.js';
import { BrazilianState } from '../application/entities/vo/brazilian-state.vo.js';
import { City } from '../application/entities/vo/city.vo.js';
import { Email } from '../application/entities/vo/email.vo.js';
import { PersonName } from '../application/entities/vo/person-name.vo.js';
import type { CreateAccountGateway } from '../application/usecases/create-account/create-account.gateway.js';
import type { ResendVerificationCodeGateway } from '../application/usecases/resend-verification-code/resend-verification-code.gateway.js';
import type { VerifyEmailGateway } from '../application/usecases/verify-email/verify-email.gateway.js';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  city: string;
  state: string;
  status: UserStatus;
  createdAt: Date;
}

export interface TermsAcceptanceRecord {
  id: string;
  userId: string;
  termsVersion: string;
  acceptedAt: Date;
}

export interface VerificationCodeRecord {
  id: string;
  userId: string;
  purpose: VerificationPurpose;
  codeHash: string;
  attempts: number;
  expiresAt: Date;
  consumedAt: Date | null;
  invalidatedAt: Date | null;
  createdAt: Date;
}

/**
 * Banco em memória que implementa os gateways dos casos de uso de `auth`,
 * com as mesmas garantias dos adaptadores Prisma: e-mail único, gravações
 * atômicas e atualizações condicionais.
 */
export class InMemoryAuthDatabase
  implements
    CreateAccountGateway,
    VerifyEmailGateway,
    ResendVerificationCodeGateway
{
  readonly users: UserRecord[] = [];
  readonly termsAcceptances: TermsAcceptanceRecord[] = [];
  readonly verificationCodes: VerificationCodeRecord[] = [];

  /** Faz a próxima gravação falhar, como uma transação que não completa. */
  failNextWrite = false;

  async findUserByEmail(email: Email | string): Promise<User | null> {
    const value = typeof email === 'string' ? email : email.value;
    const record = this.users.find((user) => user.email === value);

    return record === undefined ? null : this.toUser(record);
  }

  async listVerificationCodeIssueDates(
    userId: string,
    since: Date,
  ): Promise<Date[]> {
    return this.verificationCodes
      .filter(
        (code) =>
          code.userId === userId &&
          code.purpose === 'EMAIL_VERIFICATION' &&
          code.createdAt.getTime() > since.getTime(),
      )
      .map((code) => code.createdAt);
  }

  async createAccount(data: {
    user: User;
    termsAcceptance: TermsAcceptance;
    verificationCode: VerificationCode;
  }): Promise<void> {
    this.ensureWriteSucceeds();

    if (this.users.some((user) => user.email === data.user.email.value)) {
      throw new EmailAlreadyRegisteredException();
    }

    this.users.push(toUserRecord(data.user));
    this.termsAcceptances.push({ ...data.termsAcceptance });
    this.verificationCodes.push(toCodeRecord(data.verificationCode));
  }

  async redoSignUp(data: {
    user: User;
    termsAcceptance: TermsAcceptance | null;
    verificationCode: VerificationCode;
  }): Promise<void> {
    this.ensureWriteSucceeds();

    const index = this.users.findIndex(
      (user) =>
        user.id === data.user.id && user.status === 'PENDING_VERIFICATION',
    );

    if (index === -1) {
      throw new EmailAlreadyRegisteredException();
    }

    this.users[index] = toUserRecord(data.user);

    if (data.termsAcceptance !== null) {
      this.termsAcceptances.push({ ...data.termsAcceptance });
    }

    this.storeReplacingActiveCodes(data.verificationCode);
  }

  async replaceVerificationCode(
    verificationCode: VerificationCode,
  ): Promise<void> {
    this.ensureWriteSucceeds();
    this.storeReplacingActiveCodes(verificationCode);
  }

  async findActiveVerificationCode(
    userId: string,
  ): Promise<VerificationCode | null> {
    const active = this.verificationCodes
      .filter(
        (code) =>
          code.userId === userId &&
          code.purpose === 'EMAIL_VERIFICATION' &&
          code.consumedAt === null &&
          code.invalidatedAt === null,
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    return active === undefined
      ? null
      : VerificationCode.restore({ ...active });
  }

  async registerFailedAttempt(verificationCodeId: string): Promise<void> {
    const code = this.verificationCodes.find(
      ({ id }) => id === verificationCodeId,
    );

    if (code !== undefined && code.attempts < MAX_VERIFICATION_ATTEMPTS) {
      code.attempts += 1;
    }
  }

  async confirmEmail(data: {
    user: User;
    verificationCode: VerificationCode;
  }): Promise<void> {
    this.ensureWriteSucceeds();

    const code = this.verificationCodes.find(
      ({ id }) => id === data.verificationCode.id,
    );

    if (
      code === undefined ||
      code.consumedAt !== null ||
      code.invalidatedAt !== null ||
      code.attempts >= MAX_VERIFICATION_ATTEMPTS
    ) {
      throw new InvalidVerificationCodeException();
    }

    code.consumedAt = data.verificationCode.consumedAt;
    const user = this.users.find(({ id }) => id === data.user.id);

    if (user !== undefined) {
      user.status = data.user.status;
    }
  }

  // Auxiliares para os testes

  insertUser(record: Partial<UserRecord> & Pick<UserRecord, 'id' | 'email'>) {
    const user: UserRecord = {
      name: 'Ana Souza',
      passwordHash: 'hash',
      city: 'São Paulo',
      state: 'SP',
      status: 'PENDING_VERIFICATION',
      createdAt: new Date('2026-11-16T09:00:00.000Z'),
      ...record,
    };
    this.users.push(user);
    this.termsAcceptances.push({
      id: `${user.id}-terms-1`,
      userId: user.id,
      termsVersion: '1',
      acceptedAt: user.createdAt,
    });

    return user;
  }

  insertVerificationCode(
    record: Partial<VerificationCodeRecord> &
      Pick<VerificationCodeRecord, 'id' | 'userId' | 'codeHash' | 'createdAt'>,
  ) {
    const code: VerificationCodeRecord = {
      purpose: 'EMAIL_VERIFICATION',
      attempts: 0,
      expiresAt: new Date(record.createdAt.getTime() + 15 * 60_000),
      consumedAt: null,
      invalidatedAt: null,
      ...record,
    };
    this.verificationCodes.push(code);

    return code;
  }

  userByEmail(email: string): UserRecord | undefined {
    return this.users.find((user) => user.email === email);
  }

  codesOf(userId: string): VerificationCodeRecord[] {
    return this.verificationCodes.filter((code) => code.userId === userId);
  }

  private storeReplacingActiveCodes(verificationCode: VerificationCode) {
    for (const code of this.verificationCodes) {
      if (
        code.userId === verificationCode.userId &&
        code.purpose === verificationCode.purpose &&
        code.consumedAt === null &&
        code.invalidatedAt === null
      ) {
        code.invalidatedAt = verificationCode.createdAt;
      }
    }

    this.verificationCodes.push(toCodeRecord(verificationCode));
  }

  private ensureWriteSucceeds(): void {
    if (this.failNextWrite) {
      this.failNextWrite = false;
      throw new Error('Falha simulada na transação');
    }
  }

  private toUser(record: UserRecord): User {
    return User.restore({
      id: record.id,
      name: PersonName.create(record.name),
      email: Email.create(record.email),
      passwordHash: record.passwordHash,
      city: City.create(record.city),
      state: BrazilianState.create(record.state),
      status: record.status,
      createdAt: record.createdAt,
      acceptedTermsVersions: this.termsAcceptances
        .filter((acceptance) => acceptance.userId === record.id)
        .map((acceptance) => acceptance.termsVersion),
    });
  }
}

function toUserRecord(user: User): UserRecord {
  return {
    id: user.id,
    name: user.name.value,
    email: user.email.value,
    passwordHash: user.passwordHash,
    city: user.city.value,
    state: user.state.value,
    status: user.status,
    createdAt: user.createdAt,
  };
}

function toCodeRecord(code: VerificationCode): VerificationCodeRecord {
  return {
    id: code.id,
    userId: code.userId,
    purpose: code.purpose,
    codeHash: code.codeHash,
    attempts: code.attempts,
    expiresAt: code.expiresAt,
    consumedAt: code.consumedAt,
    invalidatedAt: code.invalidatedAt,
    createdAt: code.createdAt,
  };
}
