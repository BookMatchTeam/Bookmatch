import { randomInt } from 'node:crypto';
import type { VerificationCodeGenerator } from '../../application/gateways/verification-code-generator.gateway.js';

const CODE_RANGE = 1_000_000;

/** Código de 6 dígitos sorteado com o gerador criptográfico (RN-11). */
export class RandomVerificationCodeGenerator implements VerificationCodeGenerator {
  constructor(
    private readonly random: (min: number, max: number) => number = randomInt,
  ) {}

  generate(): string {
    return String(this.random(0, CODE_RANGE)).padStart(6, '0');
  }
}
