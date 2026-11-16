import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import type { User } from '../../../application/entities/user.entity.js';
import type { VerificationCode } from '../../../application/entities/verification-code.entity.js';
import type { ResendVerificationCodeGateway } from '../../../application/usecases/resend-verification-code/resend-verification-code.gateway.js';
import {
  findUserByEmail,
  listVerificationCodeIssueDates,
  replaceActiveVerificationCodes,
} from './prisma-auth.queries.js';

@Injectable()
export class PrismaResendVerificationCodeGateway implements ResendVerificationCodeGateway {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string): Promise<User | null> {
    return findUserByEmail(this.prisma, email);
  }

  listVerificationCodeIssueDates(userId: string, since: Date): Promise<Date[]> {
    return listVerificationCodeIssueDates(this.prisma, userId, since);
  }

  async replaceVerificationCode(
    verificationCode: VerificationCode,
  ): Promise<void> {
    await this.prisma.$transaction((transaction) =>
      replaceActiveVerificationCodes(transaction, verificationCode),
    );
  }
}
