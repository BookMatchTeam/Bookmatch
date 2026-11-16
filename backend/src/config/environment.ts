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

  string(variable: string): string {
    const value = this.environment[variable];

    if (value === undefined || value.trim() === '') {
      this.issues.push({ variable, message: 'obrigatória' });
      return '';
    }

    return value;
  }

  port(variable: string): number {
    const value = this.string(variable);

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
}

export function validateEnvironment(environment: Environment): AppConfig {
  const read = new EnvironmentReader(environment);

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
  };

  if (read.issues.length > 0) {
    throw new ConfigurationValidationError(read.issues);
  }

  return Object.freeze(config);
}
