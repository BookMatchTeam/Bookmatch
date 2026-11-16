export interface VerificationCodeEmail {
  readonly subject: string;
  readonly text: string;
  readonly html: string;
}

/** Conteúdo do e-mail com o código de verificação (RN-20). */
export function buildVerificationCodeEmail(
  code: string,
): VerificationCodeEmail {
  return {
    subject: 'Seu código de verificação do BookMatch',
    text: [
      'Olá!',
      '',
      `Seu código de verificação do BookMatch é: ${code}`,
      '',
      'Ele vale por 15 minutos.',
      '',
      'Se você não criou uma conta no BookMatch, ignore este e-mail.',
    ].join('\n'),
    html: [
      '<p>Olá!</p>',
      '<p>Seu código de verificação do BookMatch é:</p>',
      `<p style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</p>`,
      '<p>Ele vale por 15 minutos.</p>',
      '<p>Se você não criou uma conta no BookMatch, ignore este e-mail.</p>',
    ].join('\n'),
  };
}
