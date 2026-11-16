import { InvalidEmailException } from '../../exceptions/invalid-email.exception.js';
import { Email } from './email.vo.js';

describe('Email', () => {
  it('remove os espaços das pontas e converte para minúsculas', () => {
    expect(Email.create('  Ana@Exemplo.COM ').value).toBe('ana@exemplo.com');
  });

  it.each(['ana@exemplo.com', 'ana.souza+livros@sub.exemplo.com.br', 'a@b.co'])(
    'aceita %j',
    (value) => {
      expect(Email.create(value).value).toBe(value);
    },
  );

  it.each([
    '',
    '   ',
    'ana@',
    '@exemplo.com',
    'ana',
    'ana@exemplo',
    'ana souza@exemplo.com',
    'ana@@exemplo.com',
    'ana@exemplo..com',
    'ana@.exemplo.com',
  ])('rejeita %j', (value) => {
    expect(() => Email.create(value)).toThrow(InvalidEmailException);
  });

  it('aceita até 254 caracteres', () => {
    const value = `${'a'.repeat(64)}@${'b'.repeat(185)}.com`;
    expect(value).toHaveLength(254);

    expect(Email.create(value).value).toBe(value);
  });

  it('rejeita mais de 254 caracteres', () => {
    const value = `${'a'.repeat(64)}@${'b'.repeat(186)}.com`;

    expect(() => Email.create(value)).toThrow(InvalidEmailException);
  });

  it('mede o tamanho depois da normalização', () => {
    const value = `  ${'a'.repeat(64)}@${'b'.repeat(185)}.com  `;

    expect(Email.create(value).value).toHaveLength(254);
  });

  it('normaliza sem validar, para buscas por e-mail', () => {
    expect(Email.normalize('  Ana@Exemplo.COM ')).toBe('ana@exemplo.com');
    expect(Email.normalize(' qualquer ')).toBe('qualquer');
  });

  it('é comparado por valor', () => {
    expect(
      Email.create('ana@exemplo.com').equals(Email.create('ANA@exemplo.com')),
    ).toBe(true);
    expect(
      Email.create('ana@exemplo.com').equals(Email.create('bia@exemplo.com')),
    ).toBe(false);
  });
});
