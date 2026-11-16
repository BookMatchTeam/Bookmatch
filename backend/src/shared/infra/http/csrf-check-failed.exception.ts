import { ApplicationException } from '../../application/exceptions/application.exception.js';

export class CsrfCheckFailedException extends ApplicationException {
  readonly code = 'CSRF_CHECK_FAILED';
  readonly kind = 'forbidden';

  constructor() {
    super('A requisição foi recusada por segurança.');
  }
}
