import { InvalidPasswordException } from '../../exceptions/invalid-password.exception.js';

const MIN_LENGTH = 8;
const MAX_LENGTH = 128;
const LETTER = /\p{L}/u;
const DIGIT = /\d/;

/**
 * Senha em texto puro, validada pela política (RN-03). Existe só até virar
 * hash: nunca é guardada nem exposta em texto ou JSON (RN-10).
 */
export class Password {
  private constructor(readonly value: string) {}

  static create(raw: string): Password {
    const length = [...raw].length;

    if (
      length < MIN_LENGTH ||
      length > MAX_LENGTH ||
      !LETTER.test(raw) ||
      !DIGIT.test(raw)
    ) {
      throw new InvalidPasswordException();
    }

    return new Password(raw);
  }

  toString(): string {
    return '[senha]';
  }

  toJSON(): string {
    return '[senha]';
  }
}
