import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApplicationException } from '../src/shared/application/exceptions/application.exception.js';
import {
  createTestApp,
  type TestApp,
  webClientHeaders,
} from './support/test-app.js';

class SampleAlreadyExistsException extends ApplicationException {
  readonly code = 'SAMPLE_ALREADY_EXISTS';
  readonly kind = 'conflict';

  constructor() {
    super('Esta amostra já existe.');
  }
}

class CreateSampleDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

@Controller('test-errors')
class ErrorsTestController {
  @Get('conflict')
  conflict(): never {
    throw new SampleAlreadyExistsException();
  }

  @Get('unexpected')
  unexpected(): never {
    throw new Error('Access denied for user bookmatch (senha: s3cr3t)');
  }

  @Post('samples')
  create(@Body() dto: CreateSampleDto): CreateSampleDto {
    return dto;
  }
}

describe('Formato de erro (e2e)', () => {
  let testApp: TestApp;

  beforeEach(async () => {
    testApp = await createTestApp({ controllers: [ErrorsTestController] });
  });

  afterEach(async () => {
    await testApp.app.close();
  });

  it('traduz uma exception da aplicação pela categoria', async () => {
    const response = await testApp.request({
      method: 'GET',
      url: '/api/test-errors/conflict',
    });

    expect(response.statusCode).toBe(409);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.json()).toEqual({
      statusCode: 409,
      code: 'SAMPLE_ALREADY_EXISTS',
      message: 'Esta amostra já existe.',
    });
  });

  it('responde 500 genérico sem vazar detalhes internos', async () => {
    const response = await testApp.request({
      method: 'GET',
      url: '/api/test-errors/unexpected',
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
    });
    expect(response.payload).not.toContain('s3cr3t');
  });

  it('responde 422 quando o corpo não passa na validação', async () => {
    const response = await testApp.request({
      method: 'POST',
      url: '/api/test-errors/samples',
      headers: webClientHeaders,
      payload: { name: '' },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toEqual({
      statusCode: 422,
      code: 'VALIDATION_ERROR',
      message: 'Os dados enviados são inválidos.',
    });
  });

  it('responde 422 quando o corpo tem campos não permitidos', async () => {
    const response = await testApp.request({
      method: 'POST',
      url: '/api/test-errors/samples',
      headers: webClientHeaders,
      payload: { name: 'livro', admin: true },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('aceita um corpo válido', async () => {
    const response = await testApp.request({
      method: 'POST',
      url: '/api/test-errors/samples',
      headers: webClientHeaders,
      payload: { name: 'livro' },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({ name: 'livro' });
  });

  it('responde 400 para JSON malformado', async () => {
    const response = await testApp.request({
      method: 'POST',
      url: '/api/test-errors/samples',
      headers: { ...webClientHeaders, 'content-type': 'application/json' },
      payload: '{"name":',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      statusCode: 400,
      code: 'BAD_REQUEST',
      message: 'A requisição é inválida.',
    });
  });

  it('documenta o formato de erro no Swagger', async () => {
    const response = await testApp.request({
      method: 'GET',
      url: '/api/docs-json',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().components.schemas.ApiErrorResponse).toMatchObject({
      type: 'object',
      required: ['statusCode', 'code', 'message'],
    });
  });

  it('responde 404 no formato único para rota inexistente sob /api', async () => {
    const response = await testApp.request({
      method: 'GET',
      url: '/api/rota-inexistente',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'Recurso não encontrado.',
    });
  });
});
