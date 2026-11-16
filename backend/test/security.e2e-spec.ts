import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { ApplicationException } from '../src/shared/application/exceptions/application.exception.js';
import { createTestApp, type TestApp } from './support/test-app.js';

class SampleRateLimitedException extends ApplicationException {
  readonly code = 'SAMPLE_RATE_LIMITED';
  readonly kind = 'too_many_requests';

  constructor() {
    super('Aguarde antes de tentar de novo.');
  }
}

@Controller('test-security')
class SecurityTestController {
  @Get()
  read(): string {
    return 'ok';
  }

  @Post()
  create(): string {
    return 'ok';
  }

  @Put()
  replace(): string {
    return 'ok';
  }

  @Patch()
  update(): string {
    return 'ok';
  }

  @Delete()
  remove(): string {
    return 'ok';
  }

  @Get('rate-limited')
  rateLimited(): never {
    throw new SampleRateLimitedException();
  }
}

const csrfError = {
  statusCode: 403,
  code: 'CSRF_CHECK_FAILED',
  message: 'A requisição foi recusada por segurança.',
};

describe('Segurança da requisição (e2e)', () => {
  let testApp: TestApp;

  beforeEach(async () => {
    testApp = await createTestApp({ controllers: [SecurityTestController] });
  });

  afterEach(async () => {
    await testApp.app.close();
  });

  describe('CORS', () => {
    it('responde ao preflight de um origin permitido (CA-30)', async () => {
      const response = await testApp.request({
        method: 'OPTIONS',
        url: '/api/auth/sign-up',
        headers: {
          origin: 'http://localhost:5173',
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'content-type,x-bookmatch-client',
        },
      });

      expect(response.statusCode).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe(
        'http://localhost:5173',
      );
      expect(response.headers['access-control-allow-credentials']).toBe('true');
      expect(
        String(response.headers['access-control-allow-headers']).split(','),
      ).toEqual(['Content-Type', 'X-BookMatch-Client']);
    });

    it('não libera um origin fora da lista (CA-31)', async () => {
      const response = await testApp.request({
        method: 'OPTIONS',
        url: '/api/auth/sign-up',
        headers: {
          origin: 'https://outro.site',
          'access-control-request-method': 'POST',
        },
      });

      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('libera o origin permitido nas respostas comuns', async () => {
      const response = await testApp.request({
        method: 'GET',
        url: '/api/test-security',
        headers: { origin: 'http://localhost:3000' },
      });

      expect(response.headers['access-control-allow-origin']).toBe(
        'http://localhost:3000',
      );
    });
  });

  describe('CSRF', () => {
    it.each(['POST', 'PUT', 'PATCH', 'DELETE'] as const)(
      'recusa %s sem X-BookMatch-Client (CA-32)',
      async (method) => {
        const response = await testApp.request({
          method,
          url: '/api/test-security',
          headers: { origin: 'http://localhost:5173' },
        });

        expect(response.statusCode).toBe(403);
        expect(response.json()).toEqual(csrfError);
      },
    );

    it('recusa um Origin fora da lista (CA-33)', async () => {
      const response = await testApp.request({
        method: 'POST',
        url: '/api/test-security',
        headers: {
          'x-bookmatch-client': 'web',
          origin: 'https://outro.site',
        },
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toEqual(csrfError);
    });

    it('aceita o header sem Origin (CA-34)', async () => {
      const response = await testApp.request({
        method: 'POST',
        url: '/api/test-security',
        headers: { 'x-bookmatch-client': 'web' },
      });

      expect(response.statusCode).toBe(201);
    });

    it('aceita o header com um Origin permitido', async () => {
      const response = await testApp.request({
        method: 'DELETE',
        url: '/api/test-security',
        headers: {
          'x-bookmatch-client': 'web',
          origin: 'http://localhost:5173',
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it('não confere requisições GET', async () => {
      const response = await testApp.request({
        method: 'GET',
        url: '/api/test-security',
        headers: { origin: 'https://outro.site' },
      });

      expect(response.statusCode).toBe(200);
    });

    it('faz o Swagger enviar o header nas chamadas de teste', async () => {
      const response = await testApp.request({
        method: 'GET',
        url: '/api/docs/swagger-ui-init.js',
      });

      expect(response.statusCode).toBe(200);
      expect(response.payload).toMatch(
        /"requestInterceptor": \(request\) => \{\s*request\.headers\[["']X-BookMatch-Client["']\] = ["']web["'];/,
      );
    });
  });

  it('responde 429 para a categoria too_many_requests (CA-35)', async () => {
    const response = await testApp.request({
      method: 'GET',
      url: '/api/test-security/rate-limited',
    });

    expect(response.statusCode).toBe(429);
    expect(response.json()).toEqual({
      statusCode: 429,
      code: 'SAMPLE_RATE_LIMITED',
      message: 'Aguarde antes de tentar de novo.',
    });
  });
});
