import { buildVerificationCodeEmail } from './verification-code-email.js';

describe('buildVerificationCodeEmail', () => {
  it('usa o template HTML com o visual das telas de autenticação', () => {
    const email = buildVerificationCodeEmail('042317');

    expect(email.html).toMatch(/^<!DOCTYPE html>/);
    expect(email.html).toContain('lang="pt-BR"');
    expect(email.html).toContain(
      'https://bookmatch.galpao.tech/icons/icon-192.png',
    );
    expect(email.html).toContain('Confirme seu e-mail');
  });

  it('preenche todas as ocorrências do código no HTML', () => {
    const email = buildVerificationCodeEmail('042317');

    expect(email.html).not.toContain('{{');
    // Pré-visualização da caixa de entrada e destaque no cartão.
    expect(email.html.split('042317')).toHaveLength(3);
  });

  it('informa a validade de 15 minutos no HTML e no texto (RN-20)', () => {
    const email = buildVerificationCodeEmail('042317');

    expect(email.html).toContain('15 minutos');
    expect(email.text).toContain('042317');
    expect(email.text).toContain('15 minutos');
  });

  it('mantém o assunto da spec (RN-20)', () => {
    expect(buildVerificationCodeEmail('042317').subject).toBe(
      'Seu código de verificação do BookMatch',
    );
  });

  it.each(['12345', '1234567', 'abc123', '<b>1</b>'])(
    'recusa um código fora do formato de 6 dígitos (%s)',
    (code) => {
      expect(() => buildVerificationCodeEmail(code)).toThrow();
    },
  );
});
