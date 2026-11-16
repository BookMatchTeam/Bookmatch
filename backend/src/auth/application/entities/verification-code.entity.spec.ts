import { InvalidVerificationCodeException } from '../exceptions/invalid-verification-code.exception.js';
import { VerificationCodeAttemptsExceededException } from '../exceptions/verification-code-attempts-exceeded.exception.js';
import { VerificationCodeExpiredException } from '../exceptions/verification-code-expired.exception.js';
import { VerificationCodeResendTooSoonException } from '../exceptions/verification-code-resend-too-soon.exception.js';
import { VerificationCodeSendLimitReachedException } from '../exceptions/verification-code-send-limit-reached.exception.js';
import {
  VerificationCode,
  type VerificationCodeProps,
} from './verification-code.entity.js';

const now = new Date('2026-11-16T10:00:00.000Z');

function secondsBefore(seconds: number): Date {
  return new Date(now.getTime() - seconds * 1_000);
}

function issue(previousIssuedAt: readonly Date[] = []): VerificationCode {
  return VerificationCode.issue({
    id: 'code-1',
    userId: 'user-1',
    codeHash: 'hash',
    previousIssuedAt,
    now,
  });
}

function restore(overrides: Partial<VerificationCodeProps> = {}) {
  return VerificationCode.restore({
    id: 'code-1',
    userId: 'user-1',
    purpose: 'EMAIL_VERIFICATION',
    codeHash: 'hash',
    attempts: 0,
    expiresAt: new Date(now.getTime() + 15 * 60_000),
    consumedAt: null,
    invalidatedAt: null,
    createdAt: now,
    ...overrides,
  });
}

describe('VerificationCode', () => {
  describe('issue', () => {
    it('cria um código de verificação de e-mail válido por 15 minutos (RN-13)', () => {
      const code = issue();

      expect(code.id).toBe('code-1');
      expect(code.userId).toBe('user-1');
      expect(code.purpose).toBe('EMAIL_VERIFICATION');
      expect(code.codeHash).toBe('hash');
      expect(code.attempts).toBe(0);
      expect(code.createdAt).toEqual(now);
      expect(code.expiresAt).toEqual(new Date('2026-11-16T10:15:00.000Z'));
      expect(code.consumedAt).toBeNull();
      expect(code.invalidatedAt).toBeNull();
    });

    it('recusa um novo envio com menos de 60 segundos do último (RN-16)', () => {
      expect(() => issue([secondsBefore(59)])).toThrow(
        VerificationCodeResendTooSoonException,
      );
    });

    it('aceita um novo envio 60 segundos depois do último (RN-16)', () => {
      expect(() => issue([secondsBefore(60)])).not.toThrow();
    });

    it('recusa o sexto envio dentro de 60 minutos (RN-17)', () => {
      const previous = [3_000, 2_000, 1_000, 500, 120].map(secondsBefore);

      expect(() => issue(previous)).toThrow(
        VerificationCodeSendLimitReachedException,
      );
    });

    it('não conta envios com mais de 60 minutos (RN-17)', () => {
      const previous = [3_660, 2_000, 1_000, 500, 120].map(secondsBefore);

      expect(() => issue(previous)).not.toThrow();
    });

    it('verifica o intervalo antes do limite da janela', () => {
      const previous = [3_000, 2_000, 1_000, 500, 10].map(secondsBefore);

      expect(() => issue(previous)).toThrow(
        VerificationCodeResendTooSoonException,
      );
    });
  });

  describe('ensureUsable', () => {
    it('aceita um código ativo', () => {
      expect(() => restore().ensureUsable(now)).not.toThrow();
    });

    it('aceita o código no último instante da validade (RN-13)', () => {
      const code = restore();

      expect(() => code.ensureUsable(code.expiresAt)).not.toThrow();
    });

    it('recusa o código expirado (RN-13)', () => {
      const code = restore();
      const afterExpiration = new Date(code.expiresAt.getTime() + 1);

      expect(() => code.ensureUsable(afterExpiration)).toThrow(
        VerificationCodeExpiredException,
      );
    });

    it('recusa o código com 5 tentativas erradas (RN-14)', () => {
      expect(() => restore({ attempts: 5 }).ensureUsable(now)).toThrow(
        VerificationCodeAttemptsExceededException,
      );
    });

    it('aceita o código com 4 tentativas erradas (RN-14)', () => {
      expect(() => restore({ attempts: 4 }).ensureUsable(now)).not.toThrow();
    });

    it.each([
      ['consumido', { consumedAt: now }],
      ['invalidado', { invalidatedAt: now }],
    ])('trata o código %s como inválido', (_, overrides) => {
      expect(() => restore(overrides).ensureUsable(now)).toThrow(
        InvalidVerificationCodeException,
      );
    });
  });

  describe('consume', () => {
    it('marca o código como consumido (RN-18)', () => {
      const code = restore();
      const consumedAt = new Date('2026-11-16T10:05:00.000Z');

      code.consume(consumedAt);

      expect(code.consumedAt).toEqual(consumedAt);
    });

    it('não consome um código que não pode ser usado', () => {
      const code = restore({ attempts: 5 });

      expect(() => code.consume(now)).toThrow(
        VerificationCodeAttemptsExceededException,
      );
      expect(code.consumedAt).toBeNull();
    });
  });
});
