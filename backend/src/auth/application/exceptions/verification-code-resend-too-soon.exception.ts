import { ApplicationException } from '../../../shared/application/exceptions/application.exception.js';

export class VerificationCodeResendTooSoonException extends ApplicationException {
  readonly code = 'VERIFICATION_CODE_RESEND_TOO_SOON';
  readonly kind = 'too_many_requests';

  constructor() {
    super('Aguarde um minuto antes de pedir um novo código.');
  }
}
