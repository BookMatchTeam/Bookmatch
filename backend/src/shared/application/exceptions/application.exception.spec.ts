import { ApplicationException } from './application.exception.js';

class SampleNotFoundException extends ApplicationException {
  readonly code = 'SAMPLE_NOT_FOUND';
  readonly kind = 'not_found';

  constructor(options?: ErrorOptions) {
    super('Amostra não encontrada.', options);
  }
}

describe('ApplicationException', () => {
  it('expõe código, categoria e mensagem definidos pelo domínio', () => {
    const exception = new SampleNotFoundException();

    expect(exception.code).toBe('SAMPLE_NOT_FOUND');
    expect(exception.kind).toBe('not_found');
    expect(exception.message).toBe('Amostra não encontrada.');
  });

  it('é um Error identificado pelo nome da subclasse', () => {
    const exception = new SampleNotFoundException();

    expect(exception).toBeInstanceOf(Error);
    expect(exception).toBeInstanceOf(ApplicationException);
    expect(exception.name).toBe('SampleNotFoundException');
  });

  it('preserva a causa original', () => {
    const cause = new Error('falha do adaptador');

    expect(new SampleNotFoundException({ cause }).cause).toBe(cause);
  });
});
