import type { Clock } from '../../../../shared/application/clock.js';
import type { IdGenerator } from '../../../../shared/application/id-generator.js';
import {
  SEND_LIMIT_WINDOW_MS,
  VerificationCode,
} from '../../entities/verification-code.entity.js';
import { Email } from '../../entities/vo/email.vo.js';
import type { VerificationCodeGenerator } from '../../gateways/verification-code-generator.gateway.js';
import type { VerificationCodeHasher } from '../../gateways/verification-code-hasher.gateway.js';
import type { VerificationCodeMailer } from '../../gateways/verification-code-mailer.gateway.js';
import type { ResendVerificationCodeGateway } from './resend-verification-code.gateway.js';
import type { ResendVerificationCodeInput } from './resend-verification-code.input.js';

export interface ResendVerificationCodeDependencies {
  readonly gateway: ResendVerificationCodeGateway;
  readonly codeGenerator: VerificationCodeGenerator;
  readonly codeHasher: VerificationCodeHasher;
  readonly mailer: VerificationCodeMailer;
  readonly idGenerator: IdGenerator;
  readonly clock: Clock;
}

/** Gera e envia um novo código para uma conta pendente (RN-15 a RN-17). */
export class ResendVerificationCodeUseCase {
  constructor(private readonly deps: ResendVerificationCodeDependencies) {}

  async execute(input: ResendVerificationCodeInput): Promise<void> {
    const { gateway } = this.deps;
    const user = await gateway.findUserByEmail(Email.normalize(input.email));

    if (user === null || user.status === 'ACTIVE') {
      // Responde como sucesso para não revelar contas (RN-21).
      return;
    }

    const now = this.deps.clock.now();
    const previousIssuedAt = await gateway.listVerificationCodeIssueDates(
      user.id,
      new Date(now.getTime() - SEND_LIMIT_WINDOW_MS),
    );
    const code = this.deps.codeGenerator.generate();
    const verificationCode = VerificationCode.issue({
      id: this.deps.idGenerator.generate(),
      userId: user.id,
      codeHash: this.deps.codeHasher.hash(code),
      previousIssuedAt,
      now,
    });

    await gateway.replaceVerificationCode(verificationCode);

    try {
      await this.deps.mailer.sendVerificationCode({
        to: user.email.value,
        code,
      });
    } catch {
      // RN-19: o novo código continua valendo. O adaptador registra o erro.
    }
  }
}
