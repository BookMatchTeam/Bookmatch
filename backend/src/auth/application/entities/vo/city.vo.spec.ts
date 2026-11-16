import { InvalidCityException } from '../../exceptions/invalid-city.exception.js';
import { City } from './city.vo.js';

describe('City', () => {
  it('remove os espaços das pontas', () => {
    expect(City.create('  São Paulo ').value).toBe('São Paulo');
  });

  it.each(['Ré', 'x'.repeat(100)])('aceita %j', (value) => {
    expect(City.create(value).value).toBe(value);
  });

  it.each([
    ['com 1 caractere', 'X'],
    ['com 1 caractere após remover os espaços', '  X  '],
    ['vazia', ''],
    ['com 101 caracteres', 'x'.repeat(101)],
  ])('rejeita cidade %s', (_, value) => {
    expect(() => City.create(value)).toThrow(InvalidCityException);
  });
});
