import { InvalidPasswordException } from '../../exceptions/invalid-password.exception.js';
import { Password } from './password.vo.js';

describe('Password', () => {
  it.each(['senha1234', 'A1bcdefg', 'çãõ12345', `a1${'x'.repeat(126)}`])(
    'aceita %j',
    (value) => {
      expect(Password.create(value).value).toBe(value);
    },
  );

  it.each([
    ['sem número', 'abcdefgh'],
    ['sem letra', '12345678'],
    ['curta', 'a1'],
    ['com 7 caracteres', 'abcde12'],
    ['com 129 caracteres', `a1${'x'.repeat(127)}`],
    ['vazia', ''],
  ])('rejeita senha %s', (_, value) => {
    expect(() => Password.create(value)).toThrow(InvalidPasswordException);
  });

  it('não remove espaços da senha', () => {
    expect(Password.create(' senha123 ').value).toBe(' senha123 ');
  });

  it('não expõe a senha ao ser convertida em texto ou JSON', () => {
    const password = Password.create('senha1234');

    expect(String(password)).not.toContain('senha1234');
    expect(JSON.stringify({ password })).not.toContain('senha1234');
  });
});
