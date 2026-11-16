import { ApplicationException } from '../../../shared/application/exceptions/application.exception.js';

export class TermsNotAcceptedException extends ApplicationException {
  readonly code = 'TERMS_NOT_ACCEPTED';
  readonly kind = 'invalid_input';

  constructor() {
    super('É preciso aceitar os termos de uso e a política de privacidade.');
  }
}
