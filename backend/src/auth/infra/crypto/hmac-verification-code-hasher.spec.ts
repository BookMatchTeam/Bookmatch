import { createHmac } from 'node:crypto';
import { HmacVerificationCodeHasher } from './hmac-verification-code-hasher.js';

const secret = 'segredo-de-teste-com-32-caracteres!';

describe('HmacVerificationCodeHasher', () => {
  const hasher = new HmacVerificationCodeHasher(secret);

  it('calcula o HMAC-SHA-256 do código com a chave, em hexadecimal (CA-15)', () => {
    expect(hasher.hash('042317')).toBe(
      createHmac('sha256', secret).update('042317').digest('hex'),
    );
    expect(hasher.hash('042317')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('depende da chave secreta', () => {
    expect(
      new HmacVerificationCodeHasher(`${secret}x`).hash('042317'),
    ).not.toBe(hasher.hash('042317'));
  });

  it('confere o código com o hash salvo', () => {
    const codeHash = hasher.hash('042317');

    expect(hasher.matches('042317', codeHash)).toBe(true);
    expect(hasher.matches('042318', codeHash)).toBe(false);
  });

  it('não confere com um hash de formato inesperado', () => {
    expect(hasher.matches('042317', 'abc')).toBe(false);
  });
});
