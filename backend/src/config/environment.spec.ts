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
  TERMS_VERSION: '1',
  CORS_ORIGINS: 'http://localhost:5173,http://localhost:3000',
  VERIFICATION_CODE_SECRET: 'a'.repeat(32),
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '465',
  SMTP_SECURE: 'true',
  SMTP_USER: 'conta@gmail.com',
  SMTP_PASSWORD: 'abcd efgh ijkl mnop',
  EMAIL_FROM_NAME: 'BookMatch',
  EMAIL_FROM_ADDRESS: 'Conta@Gmail.com',
};

const requiredVariables = Object.keys(validEnvironment);

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
      cors: {
        origins: ['http://localhost:5173', 'http://localhost:3000'],
      },
      terms: { version: '1' },
      verificationCode: { secret: 'a'.repeat(32) },
      mail: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'conta@gmail.com',
          password: 'abcdefghijklmnop',
        },
        from: '"BookMatch" <Conta@Gmail.com>',
      },
    });
  });

  it('retorna uma configuracao imutavel', () => {
    const config = validateEnvironment(validEnvironment);

    expect(Object.isFrozen(config)).toBe(true);
    expect(Object.isFrozen(config.server)).toBe(true);
    expect(Object.isFrozen(config.database)).toBe(true);
    expect(Object.isFrozen(config.cors)).toBe(true);
    expect(Object.isFrozen(config.cors.origins)).toBe(true);
    expect(Object.isFrozen(config.terms)).toBe(true);
    expect(Object.isFrozen(config.verificationCode)).toBe(true);
    expect(Object.isFrozen(config.mail)).toBe(true);
  });

  it.each(requiredVariables)('rejeita %s ausente', (variable) => {
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

  describe('TERMS_VERSION', () => {
    it.each(['1', '2026-11', 'x'.repeat(20)])('aceita %j', (value) => {
      expect(
        validateEnvironment({ ...validEnvironment, TERMS_VERSION: value }).terms
          .version,
      ).toBe(value);
    });

    it('rejeita mais de 20 caracteres', () => {
      expect(
        captureIssues({ ...validEnvironment, TERMS_VERSION: 'x'.repeat(21) }),
      ).toEqual([
        { variable: 'TERMS_VERSION', message: 'deve ter até 20 caracteres' },
      ]);
    });
  });

  describe('CORS_ORIGINS', () => {
    it('ignora espaços em volta dos itens e a barra final', () => {
      expect(
        validateEnvironment({
          ...validEnvironment,
          CORS_ORIGINS:
            ' https://bookmatch.galpao.tech/ , http://localhost:5173',
        }).cors.origins,
      ).toEqual(['https://bookmatch.galpao.tech', 'http://localhost:5173']);
    });

    it.each([
      'localhost:5173',
      'http://localhost:5173,nao-e-url',
      'ftp://arquivos.exemplo.com',
      'https://bookmatch.galpao.tech/app',
      'http://localhost:5173,',
      '*',
    ])('rejeita %j', (value) => {
      expect(
        captureIssues({ ...validEnvironment, CORS_ORIGINS: value }),
      ).toEqual([
        {
          variable: 'CORS_ORIGINS',
          message:
            'deve ser uma lista de origins separados por vírgula (ex.: https://app.exemplo.com)',
        },
      ]);
    });
  });

  describe('VERIFICATION_CODE_SECRET', () => {
    it('rejeita menos de 32 caracteres', () => {
      expect(
        captureIssues({
          ...validEnvironment,
          VERIFICATION_CODE_SECRET: 'a'.repeat(31),
        }),
      ).toEqual([
        {
          variable: 'VERIFICATION_CODE_SECRET',
          message: 'deve ter pelo menos 32 caracteres',
        },
      ]);
    });
  });

  describe('SMTP', () => {
    it('valida SMTP_PORT como porta', () => {
      expect(captureIssues({ ...validEnvironment, SMTP_PORT: 'abc' })).toEqual([
        { variable: 'SMTP_PORT', message: 'deve ser um número' },
      ]);
    });

    it.each([
      ['true', true],
      ['false', false],
    ])('lê SMTP_SECURE=%s', (value, secure) => {
      expect(
        validateEnvironment({ ...validEnvironment, SMTP_SECURE: value }).mail
          .secure,
      ).toBe(secure);
    });

    it.each(['sim', '1', 'TRUE'])('rejeita SMTP_SECURE=%s', (value) => {
      expect(
        captureIssues({ ...validEnvironment, SMTP_SECURE: value }),
      ).toEqual([
        { variable: 'SMTP_SECURE', message: 'deve ser true ou false' },
      ]);
    });

    it('remove os espaços da senha de app', () => {
      expect(
        validateEnvironment({
          ...validEnvironment,
          SMTP_PASSWORD: 'abcd efgh ijkl mnop',
        }).mail.auth,
      ).toEqual({ user: 'conta@gmail.com', password: 'abcdefghijklmnop' });
    });

    it('aceita remetente e conta iguais sem diferenciar maiúsculas', () => {
      expect(
        validateEnvironment({
          ...validEnvironment,
          SMTP_USER: 'conta@gmail.com',
          EMAIL_FROM_ADDRESS: 'Conta@Gmail.com',
        }).mail.from,
      ).toBe('"BookMatch" <Conta@Gmail.com>');
    });

    it('rejeita remetente diferente da conta autenticada', () => {
      expect(
        captureIssues({
          ...validEnvironment,
          EMAIL_FROM_ADDRESS: 'outra@gmail.com',
        }),
      ).toEqual([
        {
          variable: 'EMAIL_FROM_ADDRESS',
          message: 'deve ser igual a SMTP_USER',
        },
      ]);
    });

    it.each(['conta', 'conta@', '@gmail.com', 'conta @gmail.com'])(
      'rejeita SMTP_USER inválido: %s',
      (value) => {
        const issues = captureIssues({
          ...validEnvironment,
          SMTP_USER: value,
          EMAIL_FROM_ADDRESS: value,
        });

        expect(issues).toContainEqual({
          variable: 'SMTP_USER',
          message: 'deve ser um e-mail válido',
        });
      },
    );

    it.each(['', 'x'.repeat(101), 'Book"Match', 'Book\nMatch'])(
      'rejeita EMAIL_FROM_NAME inválido: %j',
      (value) => {
        expect(
          captureIssues({ ...validEnvironment, EMAIL_FROM_NAME: value }),
        ).toContainEqual({
          variable: 'EMAIL_FROM_NAME',
          message:
            value.trim() === ''
              ? 'obrigatória'
              : value.length > 100
                ? 'deve ter até 100 caracteres'
                : 'não pode conter aspas nem quebra de linha',
        });
      },
    );
  });
});
