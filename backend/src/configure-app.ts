import { HttpStatus, RequestMethod, ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { APP_CONFIG, type AppConfig } from './config/app-config.js';
import { ApiErrorResponse } from './shared/infra/http/api-error-response.js';
import { CLIENT_HEADER, CsrfGuard } from './shared/infra/http/csrf.guard.js';
import { GlobalExceptionFilter } from './shared/infra/http/global-exception.filter.js';

/** Prefixo das rotas da aplicação. Veja o ADR-004. */
export const API_PREFIX = 'api';

export function configureApp(app: INestApplication): void {
  const config = app.get<AppConfig>(APP_CONFIG);

  // CORS e CSRF seguem o frontend/docs/contrato-api.md (RN-23, RN-24).
  app.enableCors({
    origin: [...config.cors.origins],
    credentials: true,
    allowedHeaders: ['Content-Type', CLIENT_HEADER],
  });
  app.useGlobalGuards(new CsrfGuard(config.cors.origins));

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
    .setDescription(
      'API REST da plataforma BookMatch.\n\n' +
        `Requisições POST, PUT, PATCH e DELETE exigem o header \`${CLIENT_HEADER}: web\` ` +
        '(enviado automaticamente por esta página) e, quando há `Origin`, um ' +
        'origin permitido. Sem isso, a API responde 403 `CSRF_CHECK_FAILED`.',
    )
    .setVersion('0.0.1')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig, {
      extraModels: [ApiErrorResponse],
    });

  SwaggerModule.setup(`${API_PREFIX}/docs`, app, documentFactory, {
    swaggerOptions: {
      // Serializada para o navegador: não pode usar nada fora da função.
      requestInterceptor: (request: { headers: Record<string, string> }) => {
        request.headers['X-BookMatch-Client'] = 'web';
        return request;
      },
    },
  });
}
