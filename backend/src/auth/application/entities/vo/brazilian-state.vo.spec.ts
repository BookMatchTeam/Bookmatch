import { InvalidStateException } from '../../exceptions/invalid-state.exception.js';
import { BrazilianState } from './brazilian-state.vo.js';

const ALL_STATES = [
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
];

describe('BrazilianState', () => {
  it('aceita as 27 siglas', () => {
    expect(ALL_STATES).toHaveLength(27);

    for (const state of ALL_STATES) {
      expect(BrazilianState.create(state).value).toBe(state);
    }
  });

  it.each([
    ['sp', 'SP'],
    ['Rj', 'RJ'],
  ])('aceita %j em minúsculas e salva %j', (value, expected) => {
    expect(BrazilianState.create(value).value).toBe(expected);
  });

  it.each(['XX', '', 'S', 'SPP', ' SP', 'São Paulo'])('rejeita %j', (value) => {
    expect(() => BrazilianState.create(value)).toThrow(InvalidStateException);
  });
});
