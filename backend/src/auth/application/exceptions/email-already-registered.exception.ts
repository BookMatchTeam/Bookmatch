import { ApplicationException } from '../../../shared/application/exceptions/application.exception.js';

export class EmailAlreadyRegisteredException extends ApplicationException {
  readonly code = 'EMAIL_ALREADY_REGISTERED';
  readonly kind = 'conflict';

  constructor(options?: ErrorOptions) {
    super('Este e-mail já está cadastrado.', options);
  }
}
