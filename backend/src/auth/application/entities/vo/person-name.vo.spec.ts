import { InvalidNameException } from '../../exceptions/invalid-name.exception.js';
import { PersonName } from './person-name.vo.js';

describe('PersonName', () => {
  it('remove os espaços das pontas', () => {
    expect(PersonName.create('  Ana Souza ').value).toBe('Ana Souza');
  });

  it.each(['Al', 'x'.repeat(100), 'João da Silva'])('aceita %j', (value) => {
    expect(PersonName.create(value).value).toBe(value);
  });

  it.each([
    ['com 1 caractere após remover os espaços', ' A '],
    ['vazio', ''],
    ['só com espaços', '    '],
    ['com 101 caracteres', 'x'.repeat(101)],
  ])('rejeita nome %s', (_, value) => {
    expect(() => PersonName.create(value)).toThrow(InvalidNameException);
  });

  it('conta caracteres, e não unidades UTF-16', () => {
    expect(PersonName.create('😀'.repeat(100)).value).toBe('😀'.repeat(100));
  });
});
