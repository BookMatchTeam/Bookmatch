import type { User } from '../../entities/user.entity.js';
import type { VerificationCode } from '../../entities/verification-code.entity.js';

export interface VerifyEmailGateway {
  /** Busca pelo e-mail já normalizado. */
  findUserByEmail(email: string): Promise<User | null>;

  /**
   * O código de verificação de e-mail mais recente do usuário que não foi
   * consumido nem invalidado.
   */
  findActiveVerificationCode(userId: string): Promise<VerificationCode | null>;

  /**
   * Soma 1 em `attempts` de forma atômica, sem passar do limite (RN-14).
   */
  registerFailedAttempt(verificationCodeId: string): Promise<void>;

  /**
   * Numa transação, consome o código e ativa o usuário (RN-18). Lança
   * `InvalidVerificationCodeException` se o código deixou de estar ativo
   * enquanto era conferido.
   */
  confirmEmail(data: {
    user: User;
    verificationCode: VerificationCode;
  }): Promise<void>;
}
