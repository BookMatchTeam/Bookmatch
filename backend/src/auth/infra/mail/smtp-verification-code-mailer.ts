import { Logger, type LoggerService } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import type { AppConfig } from '../../../config/app-config.js';
import type {
  VerificationCodeMailer,
  VerificationCodeMessage,
} from '../../application/gateways/verification-code-mailer.gateway.js';
import { buildVerificationCodeEmail } from './verification-code-email.js';

export function createSmtpTransport(config: AppConfig['mail']): Transporter {
  return createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth:
      config.auth === null
        ? undefined
        : { user: config.auth.user, pass: config.auth.password },
  });
}

/**
 * Envia o código por SMTP (RN-20). Uma falha é registrada no log, sem o
 * código, e repassada para o caso de uso, que decide o que fazer (RN-19).
 */
export class SmtpVerificationCodeMailer implements VerificationCodeMailer {
  constructor(
    private readonly transporter: Transporter,
    private readonly from: string,
    private readonly logger: LoggerService = new Logger(
      SmtpVerificationCodeMailer.name,
    ),
  ) {}

  async sendVerificationCode(message: VerificationCodeMessage): Promise<void> {
    const email = buildVerificationCodeEmail(message.code);

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: message.to,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });
    } catch (error) {
      this.logger.error(
        'Falha ao enviar o e-mail com o código de verificação',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
