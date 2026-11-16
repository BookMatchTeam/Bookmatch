import { ApplicationException } from '../../../shared/application/exceptions/application.exception.js';

export class InvalidEmailException extends ApplicationException {
  readonly code = 'INVALID_EMAIL';
  readonly kind = 'invalid_input';

  constructor() {
    super('Informe um e-mail válido.');
  }
}
