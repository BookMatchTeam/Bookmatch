import type { SendEmailMessage } from '../../../email/email.service.js';
import { VerificationCodeEmailMailer } from './verification-code-email-mailer.js';

describe('VerificationCodeEmailMailer', () => {
  it('monta o código em português, com assunto e validade (RN-20)', async () => {
    const messages: SendEmailMessage[] = [];
    const emailService = {
      send: vi.fn(async (message: SendEmailMessage) => {
        messages.push(message);
        return { messageId: 'message-1' };
      }),
    };
    const mailer = new VerificationCodeEmailMailer(emailService);

    await mailer.sendVerificationCode({
      to: 'ana@exemplo.com',
      code: '042317',
    });

    expect(emailService.send).toHaveBeenCalledTimes(1);
    expect(messages[0]).toMatchObject({
      to: 'ana@exemplo.com',
      subject: 'Seu código de verificação do BookMatch',
    });
    expect(messages[0].text).toContain('042317');
    expect(messages[0].text).toContain('15 minutos');
    expect(messages[0].html).toContain('042317');
    expect(messages[0].html).toContain('15 minutos');
  });

  it('repassa a falha única do módulo de e-mail ao caso de uso', async () => {
    const failure = new Error('Falha de envio');
    const emailService = { send: vi.fn().mockRejectedValueOnce(failure) };
    const mailer = new VerificationCodeEmailMailer(emailService);

    await expect(
      mailer.sendVerificationCode({ to: 'ana@exemplo.com', code: '042317' }),
    ).rejects.toBe(failure);
  });
});
