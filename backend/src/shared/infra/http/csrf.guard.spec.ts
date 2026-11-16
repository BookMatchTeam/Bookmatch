import type { ExecutionContext } from '@nestjs/common';
import { CsrfCheckFailedException } from './csrf-check-failed.exception.js';
import { CsrfGuard } from './csrf.guard.js';

const guard = new CsrfGuard(['http://localhost:5173', 'http://localhost:3000']);

function contextFor(
  method: string,
  headers: Record<string, string | undefined>,
): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ method, headers }) }),
  } as unknown as ExecutionContext;
}

describe('CsrfGuard', () => {
  it.each(['GET', 'HEAD', 'OPTIONS'])(
    'não confere requisições %s',
    (method) => {
      expect(
        guard.canActivate(contextFor(method, { origin: 'https://outro.site' })),
      ).toBe(true);
    },
  );

  describe.each(['POST', 'PUT', 'PATCH', 'DELETE'])('%s', (method) => {
    it('exige X-BookMatch-Client: web (CA-32)', () => {
      expect(() =>
        guard.canActivate(
          contextFor(method, { origin: 'http://localhost:5173' }),
        ),
      ).toThrow(CsrfCheckFailedException);
    });

    it('recusa outro valor de X-BookMatch-Client', () => {
      expect(() =>
        guard.canActivate(
          contextFor(method, {
            'x-bookmatch-client': 'mobile',
            origin: 'http://localhost:5173',
          }),
        ),
      ).toThrow(CsrfCheckFailedException);
    });

    it('recusa um Origin fora da lista (CA-33)', () => {
      expect(() =>
        guard.canActivate(
          contextFor(method, {
            'x-bookmatch-client': 'web',
            origin: 'https://outro.site',
          }),
        ),
      ).toThrow(CsrfCheckFailedException);
    });

    it('recusa Origin "null", enviado por contextos opacos', () => {
      expect(() =>
        guard.canActivate(
          contextFor(method, { 'x-bookmatch-client': 'web', origin: 'null' }),
        ),
      ).toThrow(CsrfCheckFailedException);
    });

    it('aceita o header com um Origin da lista', () => {
      expect(
        guard.canActivate(
          contextFor(method, {
            'x-bookmatch-client': 'web',
            origin: 'http://localhost:3000',
          }),
        ),
      ).toBe(true);
    });

    it('aceita o header sem Origin, de clientes que não são navegador (CA-34)', () => {
      expect(
        guard.canActivate(contextFor(method, { 'x-bookmatch-client': 'web' })),
      ).toBe(true);
    });
  });

  it('responde 403 CSRF_CHECK_FAILED', () => {
    const exception = new CsrfCheckFailedException();

    expect(exception.kind).toBe('forbidden');
    expect(exception.code).toBe('CSRF_CHECK_FAILED');
  });
});
