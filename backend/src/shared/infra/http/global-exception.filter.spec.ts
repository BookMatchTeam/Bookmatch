import {
  type ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  type LoggerService,
  NotFoundException,
  PayloadTooLargeException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { HttpAdapterHost } from '@nestjs/core';
import {
  ApplicationException,
  type ApplicationExceptionKind,
} from '../../application/exceptions/application.exception.js';
import { GlobalExceptionFilter } from './global-exception.filter.js';

function createApplicationException(
  kind: ApplicationExceptionKind,
): ApplicationException {
  return new (class extends ApplicationException {
    readonly code = 'SAMPLE_ERROR';
    readonly kind = kind;
  })('Mensagem definida pelo domínio.');
}

function setup() {
  const request = { method: 'POST', url: '/auth/register' };
  const response = {};
  const httpAdapter = {
    reply: vi.fn(),
    getRequestMethod: vi.fn(() => request.method),
    getRequestUrl: vi.fn(() => request.url),
  };
  const logger = {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  } satisfies LoggerService;
  const host = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;
  const filter = new GlobalExceptionFilter(
    { httpAdapter } as unknown as HttpAdapterHost,
    logger,
  );

  function handle(exception: unknown) {
    filter.catch(exception, host);

    expect(httpAdapter.reply).toHaveBeenCalledTimes(1);
    const [repliedTo, body, statusCode] = httpAdapter.reply.mock.calls[0];
    expect(repliedTo).toBe(response);

    return { body, statusCode };
  }

  return { handle, logger };
}

describe('GlobalExceptionFilter', () => {
  describe('exceptions da aplicação', () => {
    it.each<[ApplicationExceptionKind, number]>([
      ['not_found', 404],
      ['conflict', 409],
      ['unauthenticated', 401],
      ['forbidden', 403],
      ['invalid_input', 422],
      ['business_rule', 422],
      ['too_many_requests', 429],
    ])('responde %s com status %i', (kind, statusCode) => {
      const { handle } = setup();

      expect(handle(createApplicationException(kind))).toEqual({
        statusCode,
        body: {
          statusCode,
          code: 'SAMPLE_ERROR',
          message: 'Mensagem definida pelo domínio.',
        },
      });
    });

    it('não registra log de erro para falhas esperadas', () => {
      const { handle, logger } = setup();

      handle(createApplicationException('conflict'));

      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  describe('exceptions HTTP do framework', () => {
    it.each([
      [
        new BadRequestException('Unexpected token } in JSON'),
        400,
        'BAD_REQUEST',
      ],
      [new NotFoundException('Cannot GET /rota-inexistente'), 404, 'NOT_FOUND'],
      [
        new PayloadTooLargeException('request entity too large'),
        413,
        'PAYLOAD_TOO_LARGE',
      ],
      [
        new UnprocessableEntityException(['name should not be empty']),
        422,
        'VALIDATION_ERROR',
      ],
      [
        new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS),
        429,
        'TOO_MANY_REQUESTS',
      ],
    ])('traduz %s para o formato único', (exception, statusCode, code) => {
      const { handle } = setup();

      const { body, statusCode: repliedStatus } = handle(exception);

      expect(repliedStatus).toBe(statusCode);
      expect(body).toEqual({
        statusCode,
        code,
        message: expect.any(String),
      });
    });

    it('não repassa a mensagem técnica do framework', () => {
      const { handle } = setup();

      const { body } = handle(
        new NotFoundException('Cannot GET /rota-inexistente'),
      );

      expect(body.message).toBe('Recurso não encontrado.');
    });

    it('usa uma resposta genérica para status 4xx sem tradução específica', () => {
      const { handle } = setup();

      expect(handle(new HttpException('Gone', HttpStatus.GONE))).toEqual({
        statusCode: 410,
        body: {
          statusCode: 410,
          code: 'REQUEST_ERROR',
          message: 'Não foi possível processar a requisição.',
        },
      });
    });

    it('trata HttpException 5xx como erro inesperado', () => {
      const { handle, logger } = setup();

      expect(
        handle(new InternalServerErrorException('detalhe interno')).body,
      ).toEqual({
        statusCode: 500,
        code: 'INTERNAL_ERROR',
        message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
      });
      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('erros inesperados', () => {
    const internalError = new Error(
      'Access denied for user bookmatch@10.0.0.3 (senha: s3cr3t)',
    );

    it('responde 500 com mensagem genérica', () => {
      const { handle } = setup();

      expect(handle(internalError)).toEqual({
        statusCode: 500,
        body: {
          statusCode: 500,
          code: 'INTERNAL_ERROR',
          message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
        },
      });
    });

    it('não expõe mensagem, stack nem nome do erro na resposta', () => {
      const { handle } = setup();

      const serializedBody = JSON.stringify(handle(internalError).body);

      expect(serializedBody).not.toContain('s3cr3t');
      expect(serializedBody).not.toContain('10.0.0.3');
      expect(serializedBody).not.toContain('Error');
      expect(serializedBody).not.toContain('at ');
    });

    it('registra no log a rota e o stack completo', () => {
      const { handle, logger } = setup();

      handle(internalError);

      expect(logger.error).toHaveBeenCalledWith(
        'Erro inesperado em POST /auth/register',
        internalError.stack,
      );
    });

    it('trata valores lançados que não são Error', () => {
      const { handle, logger } = setup();

      expect(handle('falha em texto').body).toEqual({
        statusCode: 500,
        code: 'INTERNAL_ERROR',
        message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
      });
      expect(logger.error).toHaveBeenCalledWith(
        'Erro inesperado em POST /auth/register',
        'falha em texto',
      );
    });
  });
});
