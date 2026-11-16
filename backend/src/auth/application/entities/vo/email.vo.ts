import { InvalidEmailException } from '../../exceptions/invalid-email.exception.js';

const MAX_LENGTH = 254;

/** Parte local, `@` e domínio com pelo menos um ponto, sem espaços. */
const FORMAT = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/**
 * E-mail da conta (RN-02). É guardado sem espaços nas pontas e em
 * minúsculas, e a unicidade da conta considera esse valor.
 */
export class Email {
  private constructor(readonly value: string) {}

  static create(raw: string): Email {
    const value = Email.normalize(raw);

    if (value.length > MAX_LENGTH || !FORMAT.test(value)) {
      throw new InvalidEmailException();
    }

    return new Email(value);
  }

  /**
   * Normaliza sem validar. Usado nas buscas por e-mail: um valor fora do
   * formato apenas não encontra conta.
   */
  static normalize(raw: string): string {
    return raw.trim().toLowerCase();
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
