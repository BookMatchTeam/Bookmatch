import type { Clock } from '../../../../shared/application/clock.js';
import type { IdGenerator } from '../../../../shared/application/id-generator.js';
import { TermsAcceptance } from '../../entities/terms-acceptance.entity.js';
import { User } from '../../entities/user.entity.js';
import {
  SEND_LIMIT_WINDOW_MS,
  VerificationCode,
} from '../../entities/verification-code.entity.js';
import { BrazilianState } from '../../entities/vo/brazilian-state.vo.js';
import { City } from '../../entities/vo/city.vo.js';
import { Email } from '../../entities/vo/email.vo.js';
import { Password } from '../../entities/vo/password.vo.js';
import { PersonName } from '../../entities/vo/person-name.vo.js';
import { TermsNotAcceptedException } from '../../exceptions/terms-not-accepted.exception.js';
import type { VerificationCodeGenerator } from '../../gateways/verification-code-generator.gateway.js';
import type { VerificationCodeHasher } from '../../gateways/verification-code-hasher.gateway.js';
import type { VerificationCodeMailer } from '../../gateways/verification-code-mailer.gateway.js';
import type { CreateAccountGateway } from './create-account.gateway.js';
import type { CreateAccountInput } from './create-account.input.js';
import type { CreateAccountOutput } from './create-account.output.js';
import type { PasswordHasher } from './password-hasher.gateway.js';

export interface CreateAccountDependencies {
  readonly gateway: CreateAccountGateway;
  readonly passwordHasher: PasswordHasher;
  readonly codeGenerator: VerificationCodeGenerator;
  readonly codeHasher: VerificationCodeHasher;
  readonly mailer: VerificationCodeMailer;
  readonly idGenerator: IdGenerator;
  readonly clock: Clock;
  /** Versão vigente dos termos (RN-06), vinda da configuração. */
  readonly termsVersion: string;
}

/**
 * Cria a conta pendente de verificação e envia o código por e-mail. Se o
 * e-mail for de uma conta ainda pendente, refaz o cadastro (RN-09).
 */
export class CreateAccountUseCase {
  constructor(private readonly deps: CreateAccountDependencies) {}

  async execute(input: CreateAccountInput): Promise<CreateAccountOutput> {
    const name = PersonName.create(input.name);
    const email = Email.create(input.email);
    const password = Password.create(input.password);
    const city = City.create(input.city);
    const state = BrazilianState.create(input.state);

    if (!input.acceptedTerms) {
      throw new TermsNotAcceptedException();
    }

    const { gateway, termsVersion } = this.deps;
    const existing = await gateway.findUserByEmail(email);
    const passwordHash = await this.deps.passwordHasher.hash(password);
    const code = this.deps.codeGenerator.generate();
    const codeHash = this.deps.codeHasher.hash(code);
    const now = this.deps.clock.now();
    const signUpData = { name, passwordHash, city, state, termsVersion };

    if (existing === null) {
      const user = User.createAccount({
        ...signUpData,
        id: this.deps.idGenerator.generate(),
        email,
        now,
      });

      await gateway.createAccount({
        user,
        termsAcceptance: this.acceptTerms(user, now),
        verificationCode: this.issueCode(user, codeHash, [], now),
      });
    } else {
      const termsAcceptance = existing.hasAcceptedTerms(termsVersion)
        ? null
        : this.acceptTerms(existing, now);
      existing.redoSignUp(signUpData);
      const previousIssuedAt = await gateway.listVerificationCodeIssueDates(
        existing.id,
        new Date(now.getTime() - SEND_LIMIT_WINDOW_MS),
      );

      await gateway.redoSignUp({
        user: existing,
        termsAcceptance,
        verificationCode: this.issueCode(
          existing,
          codeHash,
          previousIssuedAt,
          now,
        ),
      });
    }

    await this.sendCode(email, code);

    return { email: email.value };
  }

  private acceptTerms(user: User, now: Date): TermsAcceptance {
    return TermsAcceptance.accept({
      id: this.deps.idGenerator.generate(),
      userId: user.id,
      termsVersion: this.deps.termsVersion,
      now,
    });
  }

  private issueCode(
    user: User,
    codeHash: string,
    previousIssuedAt: readonly Date[],
    now: Date,
  ): VerificationCode {
    return VerificationCode.issue({
      id: this.deps.idGenerator.generate(),
      userId: user.id,
      codeHash,
      previousIssuedAt,
      now,
    });
  }

  /**
   * O e-mail sai só depois do commit. Uma falha no envio não desfaz o
   * cadastro: o adaptador registra o erro e a pessoa usa o reenvio (RN-19).
   */
  private async sendCode(email: Email, code: string): Promise<void> {
    try {
      await this.deps.mailer.sendVerificationCode({ to: email.value, code });
    } catch {
      // Já registrado no log pelo adaptador de e-mail.
    }
  }
}
