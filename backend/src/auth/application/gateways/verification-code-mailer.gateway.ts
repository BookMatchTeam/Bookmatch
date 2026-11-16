export interface VerificationCodeMessage {
  readonly to: string;
  readonly code: string;
}

/**
 * Envia o código de verificação por e-mail (RN-20).
 *
 * Contrato do domínio: usado pelo cadastro e pelo reenvio do código. Uma
 * falha no envio rejeita a promise; quem chama decide o que fazer (RN-19).
 */
export interface VerificationCodeMailer {
  sendVerificationCode(message: VerificationCodeMessage): Promise<void>;
}
