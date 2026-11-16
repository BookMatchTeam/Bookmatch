import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse } from '../../../shared/infra/http/api-error-response.js';

const CSRF_DESCRIPTION =
  '`CSRF_CHECK_FAILED`: falta `X-BookMatch-Client: web` ou o `Origin` não é permitido';

/**
 * Documenta as respostas de erro de uma rota, no formato único do ADR-003.
 * `codes` lista, por status, os `code` que a rota pode devolver.
 */
export function ApiErrorResponses(
  codes: Partial<Record<HttpStatus, string[]>>,
): MethodDecorator {
  const byStatus: Partial<Record<HttpStatus, string[]>> = {
    ...codes,
    [HttpStatus.FORBIDDEN]: [CSRF_DESCRIPTION],
  };

  return applyDecorators(
    ...Object.entries(byStatus).map(([status, descriptions]) =>
      ApiResponse({
        status: Number(status),
        type: ApiErrorResponse,
        description: (descriptions ?? []).join('; '),
      }),
    ),
  );
}
