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
  readonly cors: {
    /** Origins aceitos pelo CORS e pela checagem de CSRF. */
    readonly origins: readonly string[];
  };
  readonly terms: {
    /** Versão vigente dos termos de uso e da política de privacidade. */
    readonly version: string;
  };
  readonly verificationCode: {
    /** Chave do HMAC que protege os códigos de verificação salvos. */
    readonly secret: string;
  };
  readonly mail: {
    readonly host: string;
    readonly port: number;
    /** `true`: TLS direto. `false`: STARTTLS, quando o servidor oferece. */
    readonly secure: boolean;
    readonly auth: { readonly user: string; readonly password: string };
    readonly from: string;
  };
}
