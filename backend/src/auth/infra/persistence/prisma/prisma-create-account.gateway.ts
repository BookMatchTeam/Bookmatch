import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import type { TermsAcceptance } from '../../../application/entities/terms-acceptance.entity.js';
import type { User } from '../../../application/entities/user.entity.js';
import type { VerificationCode } from '../../../application/entities/verification-code.entity.js';
import type { Email } from '../../../application/entities/vo/email.vo.js';
import { EmailAlreadyRegisteredException } from '../../../application/exceptions/email-already-registered.exception.js';
import type { CreateAccountGateway } from '../../../application/usecases/create-account/create-account.gateway.js';
import {
  isUniqueConstraintViolation,
  toTermsAcceptanceRow,
  toUserData,
  toVerificationCodeRow,
} from './prisma-auth.mapper.js';
import {
  findUserByEmail,
  listVerificationCodeIssueDates,
  replaceActiveVerificationCodes,
} from './prisma-auth.queries.js';

@Injectable()
export class PrismaCreateAccountGateway implements CreateAccountGateway {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: Email): Promise<User | null> {
    return findUserByEmail(this.prisma, email.value);
  }

  listVerificationCodeIssueDates(userId: string, since: Date): Promise<Date[]> {
    return listVerificationCodeIssueDates(this.prisma, userId, since);
  }

  async createAccount(data: {
    user: User;
    termsAcceptance: TermsAcceptance;
    verificationCode: VerificationCode;
  }): Promise<void> {
    const { user } = data;

    try {
      await this.prisma.$transaction([
        this.prisma.user.create({
          data: {
            ...toUserData(user),
            id: user.id,
            email: user.email.value,
            status: user.status,
            createdAt: user.createdAt,
          },
        }),
        this.prisma.termsAcceptance.create({
          data: toTermsAcceptanceRow(data.termsAcceptance),
        }),
        this.prisma.verificationCode.create({
          data: toVerificationCodeRow(data.verificationCode),
        }),
      ]);
    } catch (error) {
      // Outra requisição gravou o mesmo e-mail depois da busca (Fluxo D).
      if (isUniqueConstraintViolation(error)) {
        throw new EmailAlreadyRegisteredException({ cause: error });
      }

      throw error;
    }
  }

  async redoSignUp(data: {
    user: User;
    termsAcceptance: TermsAcceptance | null;
    verificationCode: VerificationCode;
  }): Promise<void> {
    const { user, termsAcceptance, verificationCode } = data;

    await this.prisma.$transaction(async (transaction) => {
      const { count } = await transaction.user.updateMany({
        where: { id: user.id, status: 'PENDING_VERIFICATION' },
        data: toUserData(user),
      });

      // A conta foi ativada depois da busca.
      if (count === 0) {
        throw new EmailAlreadyRegisteredException();
      }

      if (termsAcceptance !== null) {
        // Um cadastro refeito em paralelo pode ter gravado o mesmo aceite.
        await transaction.termsAcceptance.createMany({
          data: [toTermsAcceptanceRow(termsAcceptance)],
          skipDuplicates: true,
        });
      }

      await replaceActiveVerificationCodes(transaction, verificationCode);
    });
  }
}
