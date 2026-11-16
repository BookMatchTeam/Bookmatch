import {
  Prisma,
  type User as UserRow,
  type VerificationCode as VerificationCodeRow,
} from '../../../../generated/prisma/client.js';
import type { TermsAcceptance } from '../../../application/entities/terms-acceptance.entity.js';
import { User } from '../../../application/entities/user.entity.js';
import { VerificationCode } from '../../../application/entities/verification-code.entity.js';
import { BrazilianState } from '../../../application/entities/vo/brazilian-state.vo.js';
import { City } from '../../../application/entities/vo/city.vo.js';
import { Email } from '../../../application/entities/vo/email.vo.js';
import { PersonName } from '../../../application/entities/vo/person-name.vo.js';

/** Inclui as versões dos termos já aceitas, que fazem parte do `User`. */
export const withAcceptedTermsVersions = {
  termsAcceptances: { select: { termsVersion: true } },
} satisfies Prisma.UserInclude;

type UserRowWithTerms = UserRow & {
  termsAcceptances: { termsVersion: string }[];
};

export function toUser(row: UserRowWithTerms): User {
  return User.restore({
    id: row.id,
    name: PersonName.create(row.name),
    email: Email.create(row.email),
    passwordHash: row.passwordHash,
    city: City.create(row.city),
    state: BrazilianState.create(row.state),
    status: row.status,
    createdAt: row.createdAt,
    acceptedTermsVersions: row.termsAcceptances.map(
      ({ termsVersion }) => termsVersion,
    ),
  });
}

/** Colunas do usuário que o cadastro grava ou substitui. */
export function toUserData(user: User) {
  return {
    name: user.name.value,
    passwordHash: user.passwordHash,
    city: user.city.value,
    state: user.state.value,
  } satisfies Prisma.UserUncheckedUpdateInput;
}

export function toTermsAcceptanceRow(
  acceptance: TermsAcceptance,
): Prisma.TermsAcceptanceUncheckedCreateInput {
  return {
    id: acceptance.id,
    userId: acceptance.userId,
    termsVersion: acceptance.termsVersion,
    acceptedAt: acceptance.acceptedAt,
  };
}

export function toVerificationCode(row: VerificationCodeRow): VerificationCode {
  return VerificationCode.restore({
    id: row.id,
    userId: row.userId,
    purpose: row.purpose,
    codeHash: row.codeHash,
    attempts: row.attempts,
    expiresAt: row.expiresAt,
    consumedAt: row.consumedAt,
    invalidatedAt: row.invalidatedAt,
    createdAt: row.createdAt,
  });
}

export function toVerificationCodeRow(
  code: VerificationCode,
): Prisma.VerificationCodeUncheckedCreateInput {
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

export function isUniqueConstraintViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}
