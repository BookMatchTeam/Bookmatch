import type { RequestListener, ServerResponse } from 'node:http';
import type { Type, ValueProvider } from '@nestjs/common';
import type { NestNodeApplication } from '@nestjs/platform-node';
import { NodeAdapter } from '@nestjs/platform-node';
import { Test } from '@nestjs/testing';
import {
  inject,
  type InjectOptions,
  type Response as InjectResponse,
} from 'light-my-request';
import { AppModule } from '../../src/app.module.js';
import { APP_CONFIG, type AppConfig } from '../../src/config/app-config.js';
import { configureApp } from '../../src/configure-app.js';

export const testConfig: AppConfig = {
  server: { port: 3000 },
  database: {
    host: 'localhost',
    port: 3306,
    user: 'bookmatch',
    password: 'test',
    name: 'bookmatch',
  },
  cors: { origins: ['http://localhost:5173', 'http://localhost:3000'] },
  terms: { version: '1' },
  verificationCode: { secret: 'segredo-de-teste-com-32-caracteres!' },
  mail: {
    host: 'localhost',
    port: 1025,
    secure: false,
    auth: null,
    from: 'BookMatch <nao-responda@bookmatch.local>',
  },
};

/** Headers que o frontend envia em requisições que alteram estado. */
export const webClientHeaders = {
  'x-bookmatch-client': 'web',
  origin: 'http://localhost:5173',
} as const;

const injectionResponseMethods = [
  'setTimeout',
  'writeHead',
  'write',
  'end',
  'destroy',
  'addTrailers',
] as const;

function preserveInjectionResponseMethods(response: ServerResponse): void {
  for (const methodName of injectionResponseMethods) {
    const method = response[methodName] as (...args: unknown[]) => unknown;

    Object.defineProperty(response, methodName, {
      configurable: true,
      value: method.bind(response),
    });
  }
}

function createInjectionDispatch(app: NestNodeApplication): RequestListener {
  const router = app.getHttpAdapter().getInstance();

  return (request, response) => {
    // NodeRouter aplica NodeResponse ao prototipo. Mantemos como metodos
    // proprios os coletores de resposta do injetor HTTP sem socket.
    preserveInjectionResponseMethods(response);
    router(request, response);
  };
}

export interface TestApp {
  readonly app: NestNodeApplication;
  request(options: InjectOptions): Promise<InjectResponse>;
}

export interface TestAppOptions {
  /** Rotas criadas so para o teste, para exercitar comportamentos transversais. */
  controllers?: Type[];
  /** Substitui a configuracao de teste padrao. */
  config?: AppConfig;
  /** Substitui providers da aplicacao (gateways, Clock, envio de e-mail...). */
  overrides?: ValueProvider[];
}

/**
 * Sobe a aplicacao completa (AppModule + configureApp) sem abrir porta,
 * com a configuracao de teste.
 */
export async function createTestApp(
  options: TestAppOptions = {},
): Promise<TestApp> {
  let builder = Test.createTestingModule({
    imports: [AppModule],
    controllers: options.controllers ?? [],
  })
    .overrideProvider(APP_CONFIG)
    .useValue(options.config ?? testConfig);

  for (const { provide, useValue } of options.overrides ?? []) {
    builder = builder.overrideProvider(provide).useValue(useValue);
  }

  const moduleFixture = await builder.compile();

  const app = moduleFixture.createNestApplication<NestNodeApplication>(
    new NodeAdapter(),
    { logger: false },
  );
  configureApp(app);
  await app.init();

  const dispatch = createInjectionDispatch(app);

  return {
    app,
    request: (requestOptions) => inject(dispatch, requestOptions),
  };
}
