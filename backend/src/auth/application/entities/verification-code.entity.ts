import { InvalidVerificationCodeException } from '../exceptions/invalid-verification-code.exception.js';
import { VerificationCodeAttemptsExceededException } from '../exceptions/verification-code-attempts-exceeded.exception.js';
import { VerificationCodeExpiredException } from '../exceptions/verification-code-expired.exception.js';
import { VerificationCodeResendTooSoonException } from '../exceptions/verification-code-resend-too-soon.exception.js';
import { VerificationCodeSendLimitReachedException } from '../exceptions/verification-code-send-limit-reached.exception.js';

/** Validade do código a partir da criação (RN-13). */
export const VERIFICATION_CODE_VALIDITY_MS = 15 * 60_000;

/** Tentativas erradas que bloqueiam o código (RN-14). */
export const MAX_VERIFICATION_ATTEMPTS = 5;

/** Intervalo mínimo entre dois envios para o mesmo usuário (RN-16). */
export const RESEND_INTERVAL_MS = 60_000;

/** Janela e quantidade máxima de envios por usuário (RN-17). */
export const SEND_LIMIT_WINDOW_MS = 60 * 60_000;
export const SEND_LIMIT = 5;

export type VerificationPurpose = 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';

export interface VerificationCodeProps {
  readonly id: string;
  readonly userId: string;
  readonly purpose: VerificationPurpose;
  readonly codeHash: string;
  readonly attempts: number;
  readonly expiresAt: Date;
  readonly consumedAt: Date | null;
  readonly invalidatedAt: Date | null;
  readonly createdAt: Date;
}

/**
 * Código de 6 dígitos enviado por e-mail. Só o hash fica guardado.
 *
 * Os estados não ficam numa coluna; são calculados: consumido, invalidado,
 * expirado, bloqueado ou, se nenhum deles, ativo.
 */
export class VerificationCode {
  private props: VerificationCodeProps;

  private constructor(props: VerificationCodeProps) {
    this.props = props;
  }

  /**
   * Cria um código de verificação de e-mail, respeitando os limites de envio
   * (RN-16, RN-17). `previousIssuedAt` são as datas de criação dos códigos
   * anteriores do usuário com o mesmo propósito, de pelo menos a última hora,
   * incluindo os invalidados e os consumidos.
   */
  static issue(data: {
    id: string;
    userId: string;
    codeHash: string;
    previousIssuedAt: readonly Date[];
    now: Date;
  }): VerificationCode {
    VerificationCode.ensureCanSend(data.previousIssuedAt, data.now);

    return new VerificationCode({
      id: data.id,
      userId: data.userId,
      purpose: 'EMAIL_VERIFICATION',
      codeHash: data.codeHash,
      attempts: 0,
      expiresAt: new Date(data.now.getTime() + VERIFICATION_CODE_VALIDITY_MS),
      consumedAt: null,
      invalidatedAt: null,
      createdAt: data.now,
    });
  }

  /** Limites de envio por usuário (RN-16, RN-17). */
  private static ensureCanSend(
    previousIssuedAt: readonly Date[],
    now: Date,
  ): void {
    const elapsed = previousIssuedAt.map(
      (issuedAt) => now.getTime() - issuedAt.getTime(),
    );

    if (elapsed.some((ms) => ms < RESEND_INTERVAL_MS)) {
      throw new VerificationCodeResendTooSoonException();
    }

    const sentInWindow = elapsed.filter((ms) => ms < SEND_LIMIT_WINDOW_MS);

    if (sentInWindow.length >= SEND_LIMIT) {
      throw new VerificationCodeSendLimitReachedException();
    }
  }

  static restore(props: VerificationCodeProps): VerificationCode {
    return new VerificationCode(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get purpose(): VerificationPurpose {
    return this.props.purpose;
  }

  get codeHash(): string {
    return this.props.codeHash;
  }

  get attempts(): number {
    return this.props.attempts;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get consumedAt(): Date | null {
    return this.props.consumedAt;
  }

  get invalidatedAt(): Date | null {
    return this.props.invalidatedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  /**
   * Garante que o código ainda pode ser conferido: não foi consumido nem
   * invalidado (RN-15), não expirou (RN-13) e não está bloqueado (RN-14).
   */
  ensureUsable(now: Date): void {
    if (this.props.consumedAt !== null || this.props.invalidatedAt !== null) {
      throw new InvalidVerificationCodeException();
    }

    if (now.getTime() > this.props.expiresAt.getTime()) {
      throw new VerificationCodeExpiredException();
    }

    if (this.props.attempts >= MAX_VERIFICATION_ATTEMPTS) {
      throw new VerificationCodeAttemptsExceededException();
    }
  }

  /** Marca o código como usado depois que ele conferiu (RN-18). */
  consume(now: Date): void {
    this.ensureUsable(now);
    this.props = { ...this.props, consumedAt: now };
  }
}
