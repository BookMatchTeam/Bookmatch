import { createTestApp, type TestApp } from './support/test-app.js';

describe('Health (e2e)', () => {
  let testApp: TestApp;

  beforeEach(async () => {
    testApp = await createTestApp();
  });

  afterEach(async () => {
    await testApp.app.close();
  });

  it('GET /health', async () => {
    const response = await testApp.request({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: 'ok',
      service: 'bookmatch-backend',
      timestamp: expect.any(String),
    });
  });

  it('GET /api/docs', async () => {
    const response = await testApp.request({
      method: 'GET',
      url: '/api/docs',
    });

    expect(response.statusCode).toBe(200);
    expect(response.payload).toContain('Swagger UI');
  });
});
