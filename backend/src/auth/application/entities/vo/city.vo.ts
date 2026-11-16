import { InvalidCityException } from '../../exceptions/invalid-city.exception.js';

const MIN_LENGTH = 2;
const MAX_LENGTH = 100;

/** Cidade onde a pessoa mora (RN-04). */
export class City {
  private constructor(readonly value: string) {}

  static create(raw: string): City {
    const value = raw.trim();
    const length = [...value].length;

    if (length < MIN_LENGTH || length > MAX_LENGTH) {
      throw new InvalidCityException();
    }

    return new City(value);
  }
}
