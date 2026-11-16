import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { CsrfCheckFailedException } from './csrf-check-failed.exception.js';

/** Header que o frontend envia em toda requisição que altera estado. */
export const CLIENT_HEADER = 'X-BookMatch-Client';
const CLIENT_HEADER_VALUE = 'web';

const STATE_CHANGING_METHODS: ReadonlySet<string> = new Set([
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
]);

interface HttpRequest {
  readonly method: string;
  readonly headers: Readonly<Record<string, string | string[] | undefined>>;
}

/**
 * Proteção contra CSRF (RN-24): requisições que alteram estado precisam do
 * header `X-BookMatch-Client: web`, que força o preflight do CORS, e de um
 * `Origin` da lista permitida, quando o navegador o envia.
 *
 * Requisições sem `Origin` vêm de clientes que não são navegador e não
 * carregam cookies de outro site, por isso passam pela checagem de origem.
 */
export class CsrfGuard implements CanActivate {
  private readonly allowedOrigins: ReadonlySet<string>;

  constructor(allowedOrigins: readonly string[]) {
    this.allowedOrigins = new Set(allowedOrigins);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<HttpRequest>();

    if (!STATE_CHANGING_METHODS.has(request.method.toUpperCase())) {
      return true;
    }

    const client = request.headers[CLIENT_HEADER.toLowerCase()];
    const origin = request.headers.origin;

    if (client !== CLIENT_HEADER_VALUE) {
      throw new CsrfCheckFailedException();
    }

    if (
      origin !== undefined &&
      origin !== '' &&
      (typeof origin !== 'string' || !this.allowedOrigins.has(origin))
    ) {
      throw new CsrfCheckFailedException();
    }

    return true;
  }
}
