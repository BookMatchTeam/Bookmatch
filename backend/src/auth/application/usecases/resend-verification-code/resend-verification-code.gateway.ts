import type { User } from '../../entities/user.entity.js';
import type { VerificationCode } from '../../entities/verification-code.entity.js';

export interface ResendVerificationCodeGateway {
  /** Busca pelo e-mail já normalizado. */
  findUserByEmail(email: string): Promise<User | null>;

  /** Datas de criação dos códigos do usuário criados depois de `since`. */
  listVerificationCodeIssueDates(userId: string, since: Date): Promise<Date[]>;

  /**
   * Numa transação, invalida os códigos ativos do usuário e grava o novo
   * (RN-15).
   */
  replaceVerificationCode(verificationCode: VerificationCode): Promise<void>;
}
