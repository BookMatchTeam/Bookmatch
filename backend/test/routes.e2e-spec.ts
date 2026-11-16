import { Controller, Get } from '@nestjs/common';
import { createTestApp, type TestApp } from './support/test-app.js';

@Controller('samples')
class SamplesTestController {
  @Get()
  list(): string[] {
    return ['amostra'];
  }
}

describe('Prefixo de rotas (e2e)', () => {
  let testApp: TestApp;

  beforeEach(async () => {
    testApp = await createTestApp({ controllers: [SamplesTestController] });
  });

  afterEach(async () => {
    await testApp.app.close();
  });

  it('publica as rotas da aplicação sob /api', async () => {
    const response = await testApp.request({
      method: 'GET',
      url: '/api/samples',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(['amostra']);
  });

  it('não publica as rotas da aplicação sem o prefixo', async () => {
    const response = await testApp.request({ method: 'GET', url: '/samples' });

    expect(response.statusCode).toBe(404);
  });

  it('mantém /health fora do prefixo, para a infraestrutura', async () => {
    const withoutPrefix = await testApp.request({
      method: 'GET',
      url: '/health',
    });
    const withPrefix = await testApp.request({
      method: 'GET',
      url: '/api/health',
    });

    expect(withoutPrefix.statusCode).toBe(200);
    expect(withPrefix.statusCode).toBe(404);
  });

  it('mantém o Swagger em /api/docs', async () => {
    const response = await testApp.request({
      method: 'GET',
      url: '/api/docs',
    });

    expect(response.statusCode).toBe(200);
  });
});
