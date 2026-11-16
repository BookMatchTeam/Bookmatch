import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import type { User } from '../../../application/entities/user.entity.js';
import {
  MAX_VERIFICATION_ATTEMPTS,
  type VerificationCode,
} from '../../../application/entities/verification-code.entity.js';
import { InvalidVerificationCodeException } from '../../../application/exceptions/invalid-verification-code.exception.js';
import type { VerifyEmailGateway } from '../../../application/usecases/verify-email/verify-email.gateway.js';
import { toVerificationCode } from './prisma-auth.mapper.js';
import { findUserByEmail } from './prisma-auth.queries.js';

@Injectable()
export class PrismaVerifyEmailGateway implements VerifyEmailGateway {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string): Promise<User | null> {
    return findUserByEmail(this.prisma, email);
  }

  async findActiveVerificationCode(
    userId: string,
  ): Promise<VerificationCode | null> {
    const row = await this.prisma.verificationCode.findFirst({
      where: {
        userId,
        purpose: 'EMAIL_VERIFICATION',
        consumedAt: null,
        invalidatedAt: null,
      },
      // UUID v7 desempata códigos criados no mesmo milissegundo.
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    return row === null ? null : toVerificationCode(row);
  }

  async registerFailedAttempt(verificationCodeId: string): Promise<void> {
    // Incremento atômico e condicional: tentativas simultâneas não passam do
    // limite (RN-14).
    await this.prisma.verificationCode.updateMany({
      where: {
        id: verificationCodeId,
        attempts: { lt: MAX_VERIFICATION_ATTEMPTS },
      },
      data: { attempts: { increment: 1 } },
    });
  }

  async confirmEmail(data: {
    user: User;
    verificationCode: VerificationCode;
  }): Promise<void> {
    const { user, verificationCode } = data;

    await this.prisma.$transaction(async (transaction) => {
      // Só consome se o código continua ativo: protege contra uma tentativa
      // errada, um reenvio ou outra confirmação acontecendo ao mesmo tempo.
      const { count } = await transaction.verificationCode.updateMany({
        where: {
          id: verificationCode.id,
          consumedAt: null,
          invalidatedAt: null,
          attempts: { lt: MAX_VERIFICATION_ATTEMPTS },
        },
        data: { consumedAt: verificationCode.consumedAt },
      });

      if (count === 0) {
        throw new InvalidVerificationCodeException();
      }

      await transaction.user.update({
        where: { id: user.id },
        data: { status: user.status },
      });
    });
  }
}
