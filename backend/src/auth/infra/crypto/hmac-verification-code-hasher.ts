import { createHmac, timingSafeEqual } from 'node:crypto';
import type { VerificationCodeHasher } from '../../application/gateways/verification-code-hasher.gateway.js';

/**
 * HMAC-SHA-256 do código com `VERIFICATION_CODE_SECRET`, em hexadecimal
 * (RN-12). Com só um milhão de valores possíveis, um hash sem chave seria
 * revertido por força bruta a partir de um vazamento do banco.
 */
export class HmacVerificationCodeHasher implements VerificationCodeHasher {
  constructor(private readonly secret: string) {}

  hash(code: string): string {
    return createHmac('sha256', this.secret).update(code).digest('hex');
  }

  matches(code: string, codeHash: string): boolean {
    const expected = Buffer.from(this.hash(code), 'hex');
    const actual = Buffer.from(codeHash, 'hex');

    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  }
}
