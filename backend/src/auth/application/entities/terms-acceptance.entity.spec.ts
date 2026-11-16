import { TermsAcceptance } from './terms-acceptance.entity.js';

describe('TermsAcceptance', () => {
  it('registra a versão aceita e o horário do aceite (RN-06)', () => {
    const acceptedAt = new Date('2026-11-16T10:00:00.000Z');

    const acceptance = TermsAcceptance.accept({
      id: 'acceptance-1',
      userId: 'user-1',
      termsVersion: '1',
      now: acceptedAt,
    });

    expect(acceptance).toEqual({
      id: 'acceptance-1',
      userId: 'user-1',
      termsVersion: '1',
      acceptedAt,
    });
  });
});
