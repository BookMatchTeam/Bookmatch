import { FixedIdGenerator } from './fixed-id-generator.js';

describe('FixedIdGenerator', () => {
  it('devolve os identificadores informados, na ordem', () => {
    const idGenerator = new FixedIdGenerator('user-1', 'user-2');

    expect(idGenerator.generate()).toBe('user-1');
    expect(idGenerator.generate()).toBe('user-2');
  });

  it('falha quando o teste pede mais identificadores do que preparou', () => {
    const idGenerator = new FixedIdGenerator('user-1');
    idGenerator.generate();

    expect(() => idGenerator.generate()).toThrowError(
      'FixedIdGenerator: nenhum identificador restante',
    );
  });
});
