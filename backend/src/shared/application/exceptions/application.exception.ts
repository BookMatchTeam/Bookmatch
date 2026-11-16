/**
 * Categorias de falha esperada da aplicação.
 *
 * A categoria descreve a natureza da falha, sem conhecer HTTP. Cabe à
 * infraestrutura traduzir cada categoria para o protocolo de entrega.
 */
export type ApplicationExceptionKind =
  | 'not_found'
  | 'conflict'
  | 'unauthenticated'
  | 'forbidden'
  | 'invalid_input'
  | 'business_rule';

/**
 * Base das falhas esperadas da aplicação.
 *
 * Cada domínio estende esta classe definindo um `code` estável, uma `kind` e
 * a mensagem segura que pode ser exibida ao cliente.
 *
 * @example
 * export class EmailAlreadyRegisteredException extends ApplicationException {
 *   readonly code = 'EMAIL_ALREADY_REGISTERED';
 *   readonly kind = 'conflict';
 *
 *   constructor() {
 *     super('Este e-mail já está cadastrado.');
 *   }
 * }
 */
export abstract class ApplicationException extends Error {
  abstract readonly code: string;
  abstract readonly kind: ApplicationExceptionKind;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}
