import type { TermsAcceptance } from '../../entities/terms-acceptance.entity.js';
import type { User } from '../../entities/user.entity.js';
import type { VerificationCode } from '../../entities/verification-code.entity.js';
import type { Email } from '../../entities/vo/email.vo.js';

export interface CreateAccountGateway {
  findUserByEmail(email: Email): Promise<User | null>;

  /** Datas de criação dos códigos do usuário criados depois de `since`. */
  listVerificationCodeIssueDates(userId: string, since: Date): Promise<Date[]>;

  /**
   * Grava o usuário, o aceite e o código numa transação (RN-07). Lança
   * `EmailAlreadyRegisteredException` se o e-mail já estiver no banco.
   */
  createAccount(data: {
    user: User;
    termsAcceptance: TermsAcceptance;
    verificationCode: VerificationCode;
  }): Promise<void>;

  /**
   * Numa transação: substitui os dados do usuário pendente, grava o aceite
   * (quando houver), invalida os códigos ativos e grava o novo (RN-09, RN-15).
   * Lança `EmailAlreadyRegisteredException` se a conta deixou de estar
   * pendente.
   */
  redoSignUp(data: {
    user: User;
    termsAcceptance: TermsAcceptance | null;
    verificationCode: VerificationCode;
  }): Promise<void>;
}
