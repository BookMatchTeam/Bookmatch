import { RandomVerificationCodeGenerator } from './random-verification-code-generator.js';

describe('RandomVerificationCodeGenerator', () => {
  it('gera códigos de 6 dígitos (RN-11)', () => {
    const generator = new RandomVerificationCodeGenerator();

    for (let index = 0; index < 1_000; index += 1) {
      expect(generator.generate()).toMatch(/^\d{6}$/);
    }
  });

  it('sorteia de 000000 a 999999 e completa com zeros à esquerda', () => {
    const randomInt = vi.fn((min: number, max: number) => {
      expect([min, max]).toEqual([0, 1_000_000]);
      return 42;
    });

    expect(new RandomVerificationCodeGenerator(randomInt).generate()).toBe(
      '000042',
    );
  });
});
