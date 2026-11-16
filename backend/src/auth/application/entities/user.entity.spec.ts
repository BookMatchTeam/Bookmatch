import { EmailAlreadyRegisteredException } from '../exceptions/email-already-registered.exception.js';
import { EmailAlreadyVerifiedException } from '../exceptions/email-already-verified.exception.js';
import { User } from './user.entity.js';
import { BrazilianState } from './vo/brazilian-state.vo.js';
import { City } from './vo/city.vo.js';
import { Email } from './vo/email.vo.js';
import { PersonName } from './vo/person-name.vo.js';

const now = new Date('2026-11-16T10:00:00.000Z');

function createPendingUser(): User {
  return User.createAccount({
    id: 'user-1',
    name: PersonName.create('Ana Souza'),
    email: Email.create('ana@exemplo.com'),
    passwordHash: 'hash-1',
    city: City.create('São Paulo'),
    state: BrazilianState.create('SP'),
    termsVersion: '1',
    now,
  });
}

describe('User', () => {
  describe('createAccount', () => {
    it('cria a conta pendente de verificação (RN-07)', () => {
      const user = createPendingUser();

      expect(user.id).toBe('user-1');
      expect(user.name.value).toBe('Ana Souza');
      expect(user.email.value).toBe('ana@exemplo.com');
      expect(user.passwordHash).toBe('hash-1');
      expect(user.city.value).toBe('São Paulo');
      expect(user.state.value).toBe('SP');
      expect(user.status).toBe('PENDING_VERIFICATION');
      expect(user.createdAt).toEqual(now);
    });

    it('registra a versão dos termos aceita no cadastro', () => {
      expect(createPendingUser().hasAcceptedTerms('1')).toBe(true);
      expect(createPendingUser().hasAcceptedTerms('2')).toBe(false);
    });
  });

  describe('redoSignUp', () => {
    it('substitui nome, senha, cidade e UF da conta pendente (RN-09)', () => {
      const user = createPendingUser();

      user.redoSignUp({
        name: PersonName.create('Ana Lima'),
        passwordHash: 'hash-2',
        city: City.create('Recife'),
        state: BrazilianState.create('PE'),
        termsVersion: '2',
      });

      expect(user.name.value).toBe('Ana Lima');
      expect(user.passwordHash).toBe('hash-2');
      expect(user.city.value).toBe('Recife');
      expect(user.state.value).toBe('PE');
      expect(user.email.value).toBe('ana@exemplo.com');
      expect(user.status).toBe('PENDING_VERIFICATION');
      expect(user.hasAcceptedTerms('1')).toBe(true);
      expect(user.hasAcceptedTerms('2')).toBe(true);
    });

    it('recusa refazer o cadastro de uma conta ativa (RN-08)', () => {
      const user = createPendingUser();
      user.verifyEmail();

      expect(() =>
        user.redoSignUp({
          name: PersonName.create('Outra Pessoa'),
          passwordHash: 'hash-2',
          city: City.create('Recife'),
          state: BrazilianState.create('PE'),
          termsVersion: '1',
        }),
      ).toThrow(EmailAlreadyRegisteredException);
      expect(user.name.value).toBe('Ana Souza');
    });
  });

  describe('verifyEmail', () => {
    it('ativa a conta pendente (RN-18)', () => {
      const user = createPendingUser();

      user.verifyEmail();

      expect(user.status).toBe('ACTIVE');
    });

    it('recusa verificar uma conta já ativa', () => {
      const user = createPendingUser();
      user.verifyEmail();

      expect(() => user.verifyEmail()).toThrow(EmailAlreadyVerifiedException);
    });
  });

  it('restaura uma conta salva sem alterar os dados', () => {
    const user = User.restore({
      id: 'user-1',
      name: PersonName.create('Ana Souza'),
      email: Email.create('ana@exemplo.com'),
      passwordHash: 'hash-1',
      city: City.create('São Paulo'),
      state: BrazilianState.create('SP'),
      status: 'ACTIVE',
      createdAt: now,
      acceptedTermsVersions: ['1'],
    });

    expect(user.status).toBe('ACTIVE');
    expect(user.hasAcceptedTerms('1')).toBe(true);
  });
});
