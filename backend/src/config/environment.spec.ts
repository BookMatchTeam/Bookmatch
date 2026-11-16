import {
  ConfigurationValidationError,
  type ConfigurationIssue,
  validateEnvironment,
} from './environment.js';

const validEnvironment = {
  PORT: '3000',
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: '3306',
  DATABASE_USER: 'bookmatch',
  DATABASE_PASSWORD: 'secret',
  DATABASE_NAME: 'bookmatch',
};

function captureIssues(
  environment: Record<string, string | undefined>,
): readonly ConfigurationIssue[] {
  try {
    validateEnvironment(environment);
  } catch (error) {
    if (error instanceof ConfigurationValidationError) {
      return error.issues;
    }

    throw error;
  }

  throw new Error('validateEnvironment deveria ter rejeitado o ambiente');
}

describe('validateEnvironment', () => {
  it('retorna a configuracao pronta e tipada quando o ambiente e valido', () => {
    expect(validateEnvironment(validEnvironment)).toEqual({
      server: { port: 3000 },
      database: {
        host: 'localhost',
        port: 3306,
        user: 'bookmatch',
        password: 'secret',
        name: 'bookmatch',
      },
    });
  });

  it('retorna uma configuracao imutavel', () => {
    const config = validateEnvironment(validEnvironment);

    expect(Object.isFrozen(config)).toBe(true);
    expect(Object.isFrozen(config.server)).toBe(true);
    expect(Object.isFrozen(config.database)).toBe(true);
  });

  it.each(Object.keys(validEnvironment))('rejeita %s ausente', (variable) => {
    const environment = { ...validEnvironment, [variable]: undefined };

    expect(captureIssues(environment)).toEqual([
      { variable, message: 'obrigatória' },
    ]);
  });

  it.each(['', '   '])(
    'rejeita uma variavel obrigatoria vazia (%j)',
    (emptyValue) => {
      expect(
        captureIssues({ ...validEnvironment, DATABASE_HOST: emptyValue }),
      ).toEqual([{ variable: 'DATABASE_HOST', message: 'obrigatória' }]);
    },
  );

  it.each(['PORT', 'DATABASE_PORT'])('valida %s como porta', (variable) => {
    expect(captureIssues({ ...validEnvironment, [variable]: '33o6' })).toEqual([
      { variable, message: 'deve ser um número' },
    ]);
  });

  it.each([
    ['33o6', 'deve ser um número'],
    ['-1', 'deve ser um número'],
    ['3306.5', 'deve ser um número'],
    ['0', 'deve estar entre 1 e 65535'],
    ['65536', 'deve estar entre 1 e 65535'],
  ])('rejeita DATABASE_PORT=%s', (databasePort, message) => {
    expect(
      captureIssues({ ...validEnvironment, DATABASE_PORT: databasePort }),
    ).toEqual([{ variable: 'DATABASE_PORT', message }]);
  });

  it.each([
    ['1', 1],
    ['65535', 65_535],
  ])('aceita DATABASE_PORT=%s no limite do intervalo', (value, port) => {
    expect(
      validateEnvironment({ ...validEnvironment, DATABASE_PORT: value })
        .database.port,
    ).toBe(port);
  });

  it('reune todos os problemas em um unico erro', () => {
    expect(
      captureIssues({
        ...validEnvironment,
        PORT: 'abc',
        DATABASE_PORT: '0',
        DATABASE_PASSWORD: undefined,
      }),
    ).toEqual([
      { variable: 'PORT', message: 'deve ser um número' },
      { variable: 'DATABASE_PORT', message: 'deve estar entre 1 e 65535' },
      { variable: 'DATABASE_PASSWORD', message: 'obrigatória' },
    ]);
  });

  it('lista os problemas na mensagem do erro', () => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        DATABASE_PORT: '33o6',
        DATABASE_PASSWORD: undefined,
      }),
    ).toThrowError(
      'Configuração inválida:\n' +
        '  - DATABASE_PORT: deve ser um número\n' +
        '  - DATABASE_PASSWORD: obrigatória',
    );
  });
});
