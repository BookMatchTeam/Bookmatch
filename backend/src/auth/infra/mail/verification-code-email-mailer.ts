import type { EmailService } from '../../../email/email.service.js';
import type {
  VerificationCodeMailer,
  VerificationCodeMessage,
} from '../../application/gateways/verification-code-mailer.gateway.js';
import { buildVerificationCodeEmail } from './verification-code-email.js';

/** Monta o conteúdo do domínio e delega o transporte ao módulo de e-mail. */
export class VerificationCodeEmailMailer implements VerificationCodeMailer {
  constructor(private readonly emailService: Pick<EmailService, 'send'>) {}

  async sendVerificationCode(message: VerificationCodeMessage): Promise<void> {
    const email = buildVerificationCodeEmail(message.code);

    await this.emailService.send({
      to: message.to,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
  }
}
