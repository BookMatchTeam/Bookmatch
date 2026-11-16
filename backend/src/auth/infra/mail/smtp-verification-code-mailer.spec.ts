import type { LoggerService } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { SmtpVerificationCodeMailer } from './smtp-verification-code-mailer.js';

const from = 'BookMatch <nao-responda@bookmatch.local>';

function createLogger() {
  return {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  } satisfies LoggerService;
}

describe('SmtpVerificationCodeMailer', () => {
  it('envia o código em português, com assunto e validade (RN-20)', async () => {
    const transporter = createTransport({ jsonTransport: true });
    const sendMail = vi.spyOn(transporter, 'sendMail');
    const mailer = new SmtpVerificationCodeMailer(
      transporter,
      from,
      createLogger(),
    );

    await mailer.sendVerificationCode({
      to: 'ana@exemplo.com',
      code: '042317',
    });

    expect(sendMail).toHaveBeenCalledTimes(1);
    const message = sendMail.mock.calls[0][0];
    expect(message).toMatchObject({
      from,
      to: 'ana@exemplo.com',
      subject: 'Seu código de verificação do BookMatch',
    });
    expect(message.text).toContain('042317');
    expect(message.text).toContain('15 minutos');
    expect(message.html).toContain('042317');
    expect(message.html).toContain('15 minutos');
  });

  it('registra a falha no log sem o código e repassa o erro (RN-19, CA-28)', async () => {
    const failure = new Error('connect ECONNREFUSED 127.0.0.1:1025');
    const transporter = createTransport({
      name: 'falha',
      version: '1.0.0',
      send: (_mail, callback) => callback(failure, undefined),
    });
    const logger = createLogger();
    const mailer = new SmtpVerificationCodeMailer(transporter, from, logger);

    await expect(
      mailer.sendVerificationCode({ to: 'ana@exemplo.com', code: '042317' }),
    ).rejects.toBe(failure);
    expect(logger.error).toHaveBeenCalledTimes(1);
    const logged = JSON.stringify(logger.error.mock.calls);
    expect(logged).toContain('ECONNREFUSED');
    expect(logged).not.toContain('042317');
  });
});
