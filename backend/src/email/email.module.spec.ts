import type { AppConfig } from '../config/app-config.js';
import { createSmtpTransport } from './email.module.js';

describe('createSmtpTransport', () => {
  it('configura Gmail na porta 465 com TLS direto e senha de app (CA-01)', () => {
    const config: AppConfig['mail'] = {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: 'conta@gmail.com', password: 'senha-de-app' },
      from: '"BookMatch" <conta@gmail.com>',
    };

    const transporter = createSmtpTransport(config);

    expect(transporter.options).toMatchObject({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: 'conta@gmail.com', pass: 'senha-de-app' },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 10_000,
    });
  });
});
