import type { AppConfig } from './app-config.js';

type Environment = Readonly<Record<string, string | undefined>>;

export interface ConfigurationIssue {
  readonly variable: string;
  readonly message: string;
}

export class ConfigurationValidationError extends Error {
  constructor(readonly issues: readonly ConfigurationIssue[]) {
    super(
      `Configuração inválida:\n${issues
        .map(({ variable, message }) => `  - ${variable}: ${message}`)
        .join('\n')}`,
    );
    this.name = 'ConfigurationValidationError';
  }
}

/**
 * Le variaveis de ambiente acumulando os problemas encontrados.
 *
 * Os leitores sempre devolvem um valor do tipo esperado para manter a
 * configuracao tipada. Quando a variavel e invalida, o valor devolvido e
 * descartavel: `validateEnvironment` lanca o erro antes de expor a
 * configuracao.
 */
class EnvironmentReader {
  readonly issues: ConfigurationIssue[] = [];

  constructor(private readonly environment: Environment) {}

  private required(variable: string): string {
    const value = this.environment[variable];

    if (value === undefined || value.trim() === '') {
      this.issues.push({ variable, message: 'obrigatória' });
      return '';
    }

    return value;
  }

  string(
    variable: string,
    options: { minLength?: number; maxLength?: number } = {},
  ): string {
    const value = this.required(variable);

    if (value === '') {
      return value;
    }

    if (options.minLength !== undefined && value.length < options.minLength) {
      this.issues.push({
        variable,
        message: `deve ter pelo menos ${options.minLength} caracteres`,
      });
    } else if (
      options.maxLength !== undefined &&
      value.length > options.maxLength
    ) {
      this.issues.push({
        variable,
        message: `deve ter até ${options.maxLength} caracteres`,
      });
    }

    return value;
  }

  boolean(variable: string): boolean {
    const value = this.required(variable);

    if (value === 'true' || value === 'false') {
      return value === 'true';
    }

    if (value !== '') {
      this.issues.push({ variable, message: 'deve ser true ou false' });
    }

    return false;
  }

  /**
   * Lista de origins (`protocolo://host[:porta]`) separados por vírgula. Uma
   * barra final é aceita e removida; caminhos, query e curingas não.
   */
  origins(variable: string): readonly string[] {
    const value = this.required(variable);

    if (value === '') {
      return Object.freeze([]);
    }

    const items = value.split(',').map((item) => item.trim());
    const origins = items.map(toOrigin);

    if (origins.some((origin) => origin === null)) {
      this.issues.push({
        variable,
        message:
          'deve ser uma lista de origins separados por vírgula (ex.: https://app.exemplo.com)',
      });
      return Object.freeze([]);
    }

    return Object.freeze(origins as string[]);
  }

  port(variable: string): number {
    const value = this.required(variable);

    if (value === '') {
      return 0;
    }

    if (!/^\d+$/.test(value)) {
      this.issues.push({ variable, message: 'deve ser um número' });
      return 0;
    }

    const port = Number(value);

    if (port < 1 || port > 65_535) {
      this.issues.push({ variable, message: 'deve estar entre 1 e 65535' });
      return 0;
    }

    return port;
  }

  email(variable: string): string {
    const value = this.required(variable);

    if (value !== '' && !isEmail(value)) {
      this.issues.push({
        variable,
        message: 'deve ser um e-mail válido',
      });
    }

    return value;
  }

  appPassword(variable: string): string {
    return this.required(variable).replaceAll(' ', '');
  }

  senderName(variable: string): string {
    const value = this.string(variable, { maxLength: 100 });

    if (value !== '' && /["\r\n]/.test(value)) {
      this.issues.push({
        variable,
        message: 'não pode conter aspas nem quebra de linha',
      });
    }

    return value;
  }
}

function toOrigin(item: string): string | null {
  if (!URL.canParse(item)) {
    return null;
  }

  const url = new URL(item);
  const isHttp = url.protocol === 'http:' || url.protocol === 'https:';

  return isHttp && item.replace(/\/$/, '') === url.origin ? url.origin : null;
}

function isEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateEnvironment(environment: Environment): AppConfig {
  const read = new EnvironmentReader(environment);
  const smtpUser = read.email('SMTP_USER');
  const smtpPassword = read.appPassword('SMTP_PASSWORD');
  const fromName = read.senderName('EMAIL_FROM_NAME');
  const fromAddress = read.email('EMAIL_FROM_ADDRESS');

  if (
    smtpUser !== '' &&
    fromAddress !== '' &&
    smtpUser.toLowerCase() !== fromAddress.toLowerCase()
  ) {
    read.issues.push({
      variable: 'EMAIL_FROM_ADDRESS',
      message: 'deve ser igual a SMTP_USER',
    });
  }

  const config: AppConfig = {
    server: Object.freeze({
      port: read.port('PORT'),
    }),
    database: Object.freeze({
      host: read.string('DATABASE_HOST'),
      port: read.port('DATABASE_PORT'),
      user: read.string('DATABASE_USER'),
      password: read.string('DATABASE_PASSWORD'),
      name: read.string('DATABASE_NAME'),
    }),
    cors: Object.freeze({
      origins: read.origins('CORS_ORIGINS'),
    }),
    terms: Object.freeze({
      version: read.string('TERMS_VERSION', { maxLength: 20 }),
    }),
    verificationCode: Object.freeze({
      secret: read.string('VERIFICATION_CODE_SECRET', { minLength: 32 }),
    }),
    mail: Object.freeze({
      host: read.string('SMTP_HOST'),
      port: read.port('SMTP_PORT'),
      secure: read.boolean('SMTP_SECURE'),
      auth: Object.freeze({ user: smtpUser, password: smtpPassword }),
      from: `"${fromName}" <${fromAddress}>`,
    }),
  };

  if (read.issues.length > 0) {
    throw new ConfigurationValidationError(read.issues);
  }

  return Object.freeze(config);
}
