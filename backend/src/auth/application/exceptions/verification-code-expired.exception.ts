import { ApplicationException } from '../../../shared/application/exceptions/application.exception.js';

export class VerificationCodeExpiredException extends ApplicationException {
  readonly code = 'VERIFICATION_CODE_EXPIRED';
  readonly kind = 'business_rule';

  constructor() {
    super('O código de verificação expirou. Peça um novo código.');
  }
}
