/**
 * Gera o valor de um código de verificação: 6 dígitos, de `000000` a
 * `999999`, com um gerador aleatório criptográfico (RN-11).
 *
 * Contrato do domínio: usado pelo cadastro e pelo reenvio do código.
 */
export interface VerificationCodeGenerator {
  generate(): string;
}
