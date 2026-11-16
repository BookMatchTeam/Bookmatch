import { ApplicationException } from '../../../shared/application/exceptions/application.exception.js';

export class InvalidStateException extends ApplicationException {
  readonly code = 'INVALID_STATE';
  readonly kind = 'invalid_input';

  constructor() {
    super('Informe a sigla de uma UF brasileira.');
  }
}
