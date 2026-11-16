import { ApplicationException } from '../../../shared/application/exceptions/application.exception.js';

export class EmailAlreadyVerifiedException extends ApplicationException {
  readonly code = 'EMAIL_ALREADY_VERIFIED';
  readonly kind = 'conflict';

  constructor() {
    super('Este e-mail já foi verificado.');
  }
}
