import { ApplicationException } from '../../../shared/application/exceptions/application.exception.js';

export class VerificationCodeSendLimitReachedException extends ApplicationException {
  readonly code = 'VERIFICATION_CODE_SEND_LIMIT_REACHED';
  readonly kind = 'too_many_requests';

  constructor() {
    super(
      'Você atingiu o limite de envios de código. Tente novamente mais tarde.',
    );
  }
}
