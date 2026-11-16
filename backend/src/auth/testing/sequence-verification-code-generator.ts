import type { VerificationCodeGenerator } from '../application/gateways/verification-code-generator.gateway.js';

/**
 * Devolve os códigos informados, na ordem. Sem códigos informados, gera
 * `000001`, `000002`...
 */
export class SequenceVerificationCodeGenerator implements VerificationCodeGenerator {
  private readonly codes: string[];
  private counter = 0;

  constructor(...codes: string[]) {
    this.codes = codes;
  }

  generate(): string {
    this.counter += 1;

    return this.codes.shift() ?? String(this.counter).padStart(6, '0');
  }
}
