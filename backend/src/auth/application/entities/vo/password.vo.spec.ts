import { InvalidPasswordException } from '../../exceptions/invalid-password.exception.js';
import { Password } from './password.vo.js';

describe('Password', () => {
  it.each([
    'Senha@1234',
    'ÇÃO#2024',
    'A1!aaaaa',
    'SENHA_123',
    'Senha 1234!',
    `A1!${'x'.repeat(125)}`,
  ])('aceita %j', (value) => {
    expect(Password.create(value).value).toBe(value);
  });

  it.each([
    ['sem letra maiúscula', 'senha@1234'],
    ['sem número', 'Senha@abcd'],
    ['sem caractere especial', 'Senha1234'],
    ['com espaço como único caractere especial', 'Senha 1234'],
    ['curta', 'Sen@1'],
    ['com 7 caracteres', 'Senh@12'],
    ['com 129 caracteres', `A1!${'x'.repeat(126)}`],
    ['vazia', ''],
  ])('rejeita senha %s', (_, value) => {
    expect(() => Password.create(value)).toThrow(InvalidPasswordException);
  });

  it('não remove espaços da senha', () => {
    expect(Password.create(' Senha@123 ').value).toBe(' Senha@123 ');
  });

  it('não expõe a senha ao ser convertida em texto ou JSON', () => {
    const password = Password.create('Senha@1234');

    expect(String(password)).not.toContain('Senha@1234');
    expect(JSON.stringify({ password })).not.toContain('Senha@1234');
  });
});
