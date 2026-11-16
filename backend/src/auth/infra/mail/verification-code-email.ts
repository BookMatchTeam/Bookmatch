import { readFileSync } from 'node:fs';

export interface VerificationCodeEmail {
  readonly subject: string;
  readonly text: string;
  readonly html: string;
}

const CODE_PLACEHOLDER = '{{code}}';
const CODE_FORMAT = /^\d{6}$/;

/**
 * Template com o visual das telas de autenticação. É copiado para `dist/`
 * pelos `assets` do `nest-cli.json` e lido uma única vez, na carga do módulo.
 */
const htmlTemplate = readFileSync(
  new URL('./templates/verification-code.html', import.meta.url),
  'utf8',
);

/** Conteúdo do e-mail com o código de verificação (RN-20). */
export function buildVerificationCodeEmail(
  code: string,
): VerificationCodeEmail {
  // O código entra no HTML sem escape: só 6 dígitos são aceitos.
  if (!CODE_FORMAT.test(code)) {
    throw new Error('O código de verificação deve ter 6 dígitos.');
  }

  return {
    subject: 'Seu código de verificação do BookMatch',
    text: [
      'Olá!',
      '',
      `Seu código de verificação do BookMatch é: ${code}`,
      '',
      'Ele vale por 15 minutos.',
      '',
      'Não compartilhe este código com ninguém. A equipe do BookMatch nunca pede o seu código.',
      '',
      'Se você não criou uma conta no BookMatch, ignore este e-mail.',
    ].join('\n'),
    html: htmlTemplate.replaceAll(CODE_PLACEHOLDER, code),
  };
}
