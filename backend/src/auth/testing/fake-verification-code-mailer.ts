import type {
  VerificationCodeMailer,
  VerificationCodeMessage,
} from '../application/gateways/verification-code-mailer.gateway.js';

/** Guarda os e-mails "enviados" e pode simular falha do servidor SMTP. */
export class FakeVerificationCodeMailer implements VerificationCodeMailer {
  readonly sent: VerificationCodeMessage[] = [];
  failing = false;

  async sendVerificationCode(message: VerificationCodeMessage): Promise<void> {
    if (this.failing) {
      throw new Error('SMTP indisponível');
    }

    this.sent.push(message);
  }

  lastCodeSentTo(email: string): string | undefined {
    return this.sent.findLast((message) => message.to === email)?.code;
  }
}
