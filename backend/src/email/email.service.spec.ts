import type { LoggerService } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import {
  EmailSendFailure,
  EmailService,
  maskEmailAddress,
} from './email.service.js';

const from = '"BookMatch" <conta@gmail.com>';

function createLogger() {
  return {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  } satisfies LoggerService;
}

describe('EmailService', () => {
  it('envia texto simples e devolve o messageId (CA-07, CA-15)', async () => {
    const transporter = createTransport({ jsonTransport: true });
    const sendMail = vi.spyOn(transporter, 'sendMail');
    const logger = createLogger();
    const service = new EmailService(transporter, from, logger);

    const result = await service.send({
      to: 'ana@exemplo.com',
      subject: 'Assunto',
      text: 'Conteúdo sigiloso',
    });

    expect(result.messageId).toEqual(expect.any(String));
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from,
        to: 'ana@exemplo.com',
        subject: 'Assunto',
        text: 'Conteúdo sigiloso',
        signal: expect.any(AbortSignal),
      }),
    );
    expect(logger.log).toHaveBeenCalledWith({
      event: 'email_sent',
      messageId: result.messageId,
      recipient: 'a***@exemplo.com',
    });
  });

  it('envia texto e HTML juntos (CA-08)', async () => {
    const transporter = createTransport({ jsonTransport: true });
    const sendMail = vi.spyOn(transporter, 'sendMail');
    const service = new EmailService(transporter, from, createLogger());

    await service.send({
      to: 'ana@exemplo.com',
      subject: 'Assunto',
      text: 'Texto',
      html: '<p>HTML</p>',
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Texto', html: '<p>HTML</p>' }),
    );
  });

  it.each(['', 'x'.repeat(201), 'linha 1\nlinha 2', 'linha 1\rlinha 2'])(
    'recusa o assunto %j antes do transporte (CA-09)',
    async (subject) => {
      const transporter = createTransport({ jsonTransport: true });
      const sendMail = vi.spyOn(transporter, 'sendMail');
      const service = new EmailService(transporter, from, createLogger());

      await expect(
        service.send({ to: 'ana@exemplo.com', subject, text: 'Texto' }),
      ).rejects.toBeInstanceOf(EmailSendFailure);
      expect(sendMail).not.toHaveBeenCalled();
    },
  );

  it('converte a falha do transporte, sem tentar novamente e sem vazar conteúdo (CA-13, CA-14)', async () => {
    const failure = Object.assign(new Error('segredo do driver'), {
      code: 'ECONNREFUSED',
    });
    const transporter = createTransport({ jsonTransport: true });
    const sendMail = vi
      .spyOn(transporter, 'sendMail')
      .mockRejectedValueOnce(failure);
    const logger = createLogger();
    const service = new EmailService(transporter, from, logger);

    await expect(
      service.send({
        to: 'ana@exemplo.com',
        subject: 'Assunto secreto',
        text: 'Código 042317',
      }),
    ).rejects.toMatchObject({
      name: 'EmailSendFailure',
      cause: failure,
    });

    expect(sendMail).toHaveBeenCalledTimes(1);
    const logged = JSON.stringify(logger.error.mock.calls);
    expect(logged).toContain('connection');
    expect(logged).toContain('a***@exemplo.com');
    expect(logged).not.toContain('Assunto secreto');
    expect(logged).not.toContain('042317');
    expect(logged).not.toContain('segredo do driver');
  });

  it('orienta sobre senha de app revogada em falha de autenticação (CA-11)', async () => {
    const failure = Object.assign(new Error('Invalid login'), {
      code: 'EAUTH',
      responseCode: 535,
    });
    const transporter = createTransport({ jsonTransport: true });
    vi.spyOn(transporter, 'sendMail').mockRejectedValueOnce(failure);
    const logger = createLogger();
    const service = new EmailService(transporter, from, logger);

    await expect(
      service.send({ to: 'ana@exemplo.com', subject: 'A', text: 'B' }),
    ).rejects.toBeInstanceOf(EmailSendFailure);

    expect(JSON.stringify(logger.error.mock.calls)).toContain(
      'a senha de app pode ter sido revogada',
    );
  });

  it('identifica a cota diária do Gmail (CA-12)', async () => {
    const failure = Object.assign(
      new Error('Daily user sending limit exceeded'),
      {
        response: '550 5.4.5 Daily user sending limit exceeded',
        responseCode: 550,
      },
    );
    const transporter = createTransport({ jsonTransport: true });
    vi.spyOn(transporter, 'sendMail').mockRejectedValueOnce(failure);
    const logger = createLogger();
    const service = new EmailService(transporter, from, logger);

    await expect(
      service.send({ to: 'ana@exemplo.com', subject: 'A', text: 'B' }),
    ).rejects.toBeInstanceOf(EmailSendFailure);

    expect(JSON.stringify(logger.error.mock.calls)).toContain(
      'cota diária do Gmail esgotada',
    );
  });

  it('abandona o envio após 10 segundos (CA-10)', async () => {
    vi.useFakeTimers();
    try {
      const transporter = createTransport({ jsonTransport: true });
      vi.spyOn(transporter, 'sendMail').mockImplementation(
        () => new Promise(() => undefined),
      );
      const logger = createLogger();
      const service = new EmailService(transporter, from, logger);
      const sending = service.send({
        to: 'ana@exemplo.com',
        subject: 'A',
        text: 'B',
      });
      const expectation =
        expect(sending).rejects.toBeInstanceOf(EmailSendFailure);

      await vi.advanceTimersByTimeAsync(10_000);
      await expectation;
      expect(JSON.stringify(logger.error.mock.calls)).toContain('timeout');
    } finally {
      vi.useRealTimers();
    }
  });

  it('registra falha da verificação inicial e deixa a aplicação subir (CA-16)', async () => {
    const transporter = createTransport({ jsonTransport: true });
    vi.spyOn(transporter, 'verify').mockRejectedValueOnce(
      Object.assign(new Error('Invalid login'), { code: 'EAUTH' }),
    );
    const logger = createLogger();
    const service = new EmailService(transporter, from, logger);

    await expect(service.onModuleInit()).resolves.toBeUndefined();
    expect(JSON.stringify(logger.error.mock.calls)).toContain(
      'smtp_startup_check_failed',
    );
  });
});

describe('maskEmailAddress', () => {
  it('mantém só a primeira letra do usuário e o domínio', () => {
    expect(maskEmailAddress('ana@exemplo.com')).toBe('a***@exemplo.com');
  });
});
