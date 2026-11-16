import { ApplicationException } from '../../../shared/application/exceptions/application.exception.js';

export class InvalidCityException extends ApplicationException {
  readonly code = 'INVALID_CITY';
  readonly kind = 'invalid_input';

  constructor() {
    super('A cidade deve ter entre 2 e 100 caracteres.');
  }
}
