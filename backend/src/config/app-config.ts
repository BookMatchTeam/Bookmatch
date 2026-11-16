export const APP_CONFIG = Symbol('APP_CONFIG');

export interface AppConfig {
  readonly server: {
    readonly port: number;
  };
  readonly database: {
    readonly host: string;
    readonly port: number;
    readonly user: string;
    readonly password: string;
    readonly name: string;
  };
}
