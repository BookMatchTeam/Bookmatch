import { HttpStatus, RequestMethod, ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiErrorResponse } from './shared/infra/http/api-error-response.js';
import { GlobalExceptionFilter } from './shared/infra/http/global-exception.filter.js';

/** Prefixo das rotas da aplicação. Veja o ADR-004. */
export const API_PREFIX = 'api';

export function configureApp(app: INestApplication): void {
  // O /health fica fora do prefixo: healthcheck do Docker, smoke test e CD
  // dependem dele e não devem mudar junto com as rotas da aplicação.
  app.setGlobalPrefix(API_PREFIX, {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter(app.get(HttpAdapterHost)));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('BookMatch API')
    .setDescription('API REST da plataforma BookMatch')
    .setVersion('0.0.1')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig, {
      extraModels: [ApiErrorResponse],
    });

  SwaggerModule.setup(`${API_PREFIX}/docs`, app, documentFactory);
}
