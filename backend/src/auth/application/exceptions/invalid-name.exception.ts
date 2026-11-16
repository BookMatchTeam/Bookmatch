import { ApplicationException } from '../../../shared/application/exceptions/application.exception.js';

export class InvalidNameException extends ApplicationException {
  readonly code = 'INVALID_NAME';
  readonly kind = 'invalid_input';

  constructor() {
    super('O nome deve ter entre 2 e 100 caracteres.');
  }
}
