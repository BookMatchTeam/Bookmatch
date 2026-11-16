import { ApplicationException } from '../../../shared/application/exceptions/application.exception.js';

export class InvalidPasswordException extends ApplicationException {
  readonly code = 'INVALID_PASSWORD';
  readonly kind = 'invalid_input';

  constructor() {
    super(
      'A senha deve ter entre 8 e 128 caracteres, com pelo menos uma letra e um número.',
    );
  }
}
