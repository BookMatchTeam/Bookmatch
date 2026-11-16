import { ApplicationException } from '../../../shared/application/exceptions/application.exception.js';

export class InvalidVerificationCodeException extends ApplicationException {
  readonly code = 'INVALID_VERIFICATION_CODE';
  readonly kind = 'business_rule';

  constructor() {
    super('Código de verificação inválido.');
  }
}
