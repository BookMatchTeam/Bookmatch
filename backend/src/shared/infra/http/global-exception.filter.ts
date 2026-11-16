import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  type LoggerService,
} from '@nestjs/common';
import type { HttpAdapterHost } from '@nestjs/core';
import {
  ApplicationException,
  type ApplicationExceptionKind,
} from '../../application/exceptions/application.exception.js';
import type { ApiErrorResponse } from './api-error-response.js';

const STATUS_BY_KIND: Record<ApplicationExceptionKind, HttpStatus> = {
  not_found: HttpStatus.NOT_FOUND,
  conflict: HttpStatus.CONFLICT,
  unauthenticated: HttpStatus.UNAUTHORIZED,
  forbidden: HttpStatus.FORBIDDEN,
  invalid_input: HttpStatus.UNPROCESSABLE_ENTITY,
  business_rule: HttpStatus.UNPROCESSABLE_ENTITY,
};

type ErrorDescription = Pick<ApiErrorResponse, 'code' | 'message'>;

/**
 * Erros HTTP gerados pelo framework (rota inexistente, JSON malformado,
 * validação de DTO...). A mensagem original do framework é técnica e em
 * inglês, por isso é substituída por uma mensagem segura.
 */
const FRAMEWORK_ERRORS: Partial<Record<HttpStatus, ErrorDescription>> = {
  [HttpStatus.BAD_REQUEST]: {
    code: 'BAD_REQUEST',
    message: 'A requisição é inválida.',
  },
  [HttpStatus.UNAUTHORIZED]: {
    code: 'UNAUTHENTICATED',
    message: 'É necessário estar autenticado.',
  },
  [HttpStatus.FORBIDDEN]: {
    code: 'FORBIDDEN',
    message: 'Você não tem permissão para realizar esta ação.',
  },
  [HttpStatus.NOT_FOUND]: {
    code: 'NOT_FOUND',
    message: 'Recurso não encontrado.',
  },
  [HttpStatus.METHOD_NOT_ALLOWED]: {
    code: 'METHOD_NOT_ALLOWED',
    message: 'Método não permitido para este recurso.',
  },
  [HttpStatus.PAYLOAD_TOO_LARGE]: {
    code: 'PAYLOAD_TOO_LARGE',
    message: 'O conteúdo enviado excede o tamanho permitido.',
  },
  [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: {
    code: 'UNSUPPORTED_MEDIA_TYPE',
    message: 'Formato de conteúdo não suportado.',
  },
  [HttpStatus.UNPROCESSABLE_ENTITY]: {
    code: 'VALIDATION_ERROR',
    message: 'Os dados enviados são inválidos.',
  },
  [HttpStatus.TOO_MANY_REQUESTS]: {
    code: 'TOO_MANY_REQUESTS',
    message: 'Muitas requisições. Tente novamente mais tarde.',
  },
};

const GENERIC_CLIENT_ERROR: ErrorDescription = {
  code: 'REQUEST_ERROR',
  message: 'Não foi possível processar a requisição.',
};

const INTERNAL_ERROR: ErrorDescription = {
  code: 'INTERNAL_ERROR',
  message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
};

/**
 * Traduz qualquer erro lançado durante uma requisição para o formato único
 * `ApiErrorResponse`.
 *
 * - `ApplicationException`: status pela categoria, código e mensagem do
 *   domínio.
 * - `HttpException` 4xx do framework: mesmo status, código e mensagem segura.
 * - Qualquer outro erro: 500 com mensagem genérica. O detalhe vai somente
 *   para o log, nunca para a resposta.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: LoggerService = new Logger(
      GlobalExceptionFilter.name,
    ),
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const context = host.switchToHttp();
    const body = this.toResponse(exception, context.getRequest());

    httpAdapter.reply(context.getResponse(), body, body.statusCode);
  }

  private toResponse(exception: unknown, request: unknown): ApiErrorResponse {
    if (exception instanceof ApplicationException) {
      return {
        statusCode: STATUS_BY_KIND[exception.kind],
        code: exception.code,
        message: exception.message,
      };
    }

    if (
      exception instanceof HttpException &&
      exception.getStatus() < HttpStatus.INTERNAL_SERVER_ERROR
    ) {
      const statusCode = exception.getStatus();

      return {
        statusCode,
        ...(FRAMEWORK_ERRORS[statusCode as HttpStatus] ?? GENERIC_CLIENT_ERROR),
      };
    }

    this.logUnexpected(exception, request);

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      ...INTERNAL_ERROR,
    };
  }

  private logUnexpected(exception: unknown, request: unknown): void {
    const { httpAdapter } = this.httpAdapterHost;
    const method: unknown = httpAdapter.getRequestMethod(request);
    const url: unknown = httpAdapter.getRequestUrl(request);

    this.logger.error(
      `Erro inesperado em ${String(method)} ${String(url)}`,
      exception instanceof Error ? exception.stack : String(exception),
    );
  }
}
