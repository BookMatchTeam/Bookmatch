export interface VerifyEmailInput {
  readonly email: string;
  /** Exatamente 6 dígitos; o formato é garantido na entrada. */
  readonly code: string;
}
