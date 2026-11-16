import type { RequestListener, ServerResponse } from 'node:http';
import type { Type } from '@nestjs/common';
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
};

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

/**
 * Sobe a aplicacao completa (AppModule + configureApp) sem abrir porta,
 * com a configuracao de teste. Controllers extras permitem exercitar
 * comportamentos transversais em rotas criadas so para o teste.
 */
export async function createTestApp(
  options: { controllers?: Type[] } = {},
): Promise<TestApp> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
    controllers: options.controllers ?? [],
  })
    .overrideProvider(APP_CONFIG)
    .useValue(testConfig)
    .compile();

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
