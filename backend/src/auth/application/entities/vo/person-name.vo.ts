import { InvalidNameException } from '../../exceptions/invalid-name.exception.js';

const MIN_LENGTH = 2;
const MAX_LENGTH = 100;

/** Nome da pessoa (RN-01). */
export class PersonName {
  private constructor(readonly value: string) {}

  static create(raw: string): PersonName {
    const value = raw.trim();
    const length = [...value].length;

    if (length < MIN_LENGTH || length > MAX_LENGTH) {
      throw new InvalidNameException();
    }

    return new PersonName(value);
  }
}
