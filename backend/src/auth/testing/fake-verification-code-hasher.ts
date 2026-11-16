import type { VerificationCodeHasher } from '../application/gateways/verification-code-hasher.gateway.js';

/** Hash previsível para testes: `hmac:<código>`. */
export class FakeVerificationCodeHasher implements VerificationCodeHasher {
  hash(code: string): string {
    return `hmac:${code}`;
  }

  matches(code: string, codeHash: string): boolean {
    return this.hash(code) === codeHash;
  }
}
