/**
 * Protege o código de verificação guardado no banco (RN-12).
 *
 * Contrato do domínio: usado pelo cadastro, pela verificação e pelo reenvio.
 */
export interface VerificationCodeHasher {
  hash(code: string): string;
  /** Compara o código informado com o hash salvo, em tempo constante. */
  matches(code: string, codeHash: string): boolean;
}
