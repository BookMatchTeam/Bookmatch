import { ApplicationException } from '../../../shared/application/exceptions/application.exception.js';

export class VerificationCodeAttemptsExceededException extends ApplicationException {
  readonly code = 'VERIFICATION_CODE_ATTEMPTS_EXCEEDED';
  readonly kind = 'business_rule';

  constructor() {
    super(
      'O código foi bloqueado após muitas tentativas erradas. Peça um novo código.',
    );
  }
}
