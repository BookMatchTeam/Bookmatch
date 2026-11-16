import type { Clock } from '../../../../shared/application/clock.js';
import { Email } from '../../entities/vo/email.vo.js';
import { InvalidVerificationCodeException } from '../../exceptions/invalid-verification-code.exception.js';
import type { VerificationCodeHasher } from '../../gateways/verification-code-hasher.gateway.js';
import type { VerifyEmailGateway } from './verify-email.gateway.js';
import type { VerifyEmailInput } from './verify-email.input.js';

export interface VerifyEmailDependencies {
  readonly gateway: VerifyEmailGateway;
  readonly codeHasher: VerificationCodeHasher;
  readonly clock: Clock;
}

/** Confere o código enviado por e-mail e ativa a conta (RN-18). */
export class VerifyEmailUseCase {
  constructor(private readonly deps: VerifyEmailDependencies) {}

  async execute(input: VerifyEmailInput): Promise<void> {
    const { gateway } = this.deps;
    const user = await gateway.findUserByEmail(Email.normalize(input.email));

    if (user === null) {
      // Não revela se o e-mail tem cadastro (RN-22).
      throw new InvalidVerificationCodeException();
    }

    user.verifyEmail();

    const verificationCode = await gateway.findActiveVerificationCode(user.id);

    if (verificationCode === null) {
      throw new InvalidVerificationCodeException();
    }

    const now = this.deps.clock.now();
    verificationCode.ensureUsable(now);

    if (!this.deps.codeHasher.matches(input.code, verificationCode.codeHash)) {
      await gateway.registerFailedAttempt(verificationCode.id);
      throw new InvalidVerificationCodeException();
    }

    verificationCode.consume(now);
    await gateway.confirmEmail({ user, verificationCode });
  }
}
