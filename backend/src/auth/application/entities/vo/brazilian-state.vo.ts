import { InvalidStateException } from '../../exceptions/invalid-state.exception.js';

const STATES: ReadonlySet<string> = new Set([
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
]);

/** Sigla de uma das 27 UFs, guardada em maiúsculas (RN-05). */
export class BrazilianState {
  private constructor(readonly value: string) {}

  static create(raw: string): BrazilianState {
    const value = raw.toUpperCase();

    if (!STATES.has(value)) {
      throw new InvalidStateException();
    }

    return new BrazilianState(value);
  }
}
