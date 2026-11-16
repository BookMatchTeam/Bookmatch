import type { Prisma } from '../../../../generated/prisma/client.js';
import type { User } from '../../../application/entities/user.entity.js';
import type { VerificationCode } from '../../../application/entities/verification-code.entity.js';
import type { PrismaService } from '../../../../prisma/prisma.service.js';
import {
  toUser,
  toVerificationCodeRow,
  withAcceptedTermsVersions,
} from './prisma-auth.mapper.js';

/** Consultas e gravações repetidas entre os gateways Prisma de `auth`. */

export async function findUserByEmail(
  prisma: PrismaService,
  email: string,
): Promise<User | null> {
  const row = await prisma.user.findUnique({
    where: { email },
    include: withAcceptedTermsVersions,
  });

  return row === null ? null : toUser(row);
}

/**
 * Datas de criação dos códigos de verificação de e-mail do usuário, inclusive
 * os invalidados e os consumidos (RN-16, RN-17). Usa o índice
 * `(user_id, purpose, created_at)`.
 */
export async function listVerificationCodeIssueDates(
  prisma: PrismaService,
  userId: string,
  since: Date,
): Promise<Date[]> {
  const rows = await prisma.verificationCode.findMany({
    where: {
      userId,
      purpose: 'EMAIL_VERIFICATION',
      createdAt: { gt: since },
    },
    select: { createdAt: true },
  });

  return rows.map(({ createdAt }) => createdAt);
}

/**
 * Invalida os códigos ativos do usuário com o mesmo propósito e grava o novo
 * (RN-15). Deve rodar dentro da transação de quem chama.
 */
export async function replaceActiveVerificationCodes(
  transaction: Prisma.TransactionClient,
  verificationCode: VerificationCode,
): Promise<void> {
  await transaction.verificationCode.updateMany({
    where: {
      userId: verificationCode.userId,
      purpose: verificationCode.purpose,
      consumedAt: null,
      invalidatedAt: null,
    },
    data: { invalidatedAt: verificationCode.createdAt },
  });
  await transaction.verificationCode.create({
    data: toVerificationCodeRow(verificationCode),
  });
}
