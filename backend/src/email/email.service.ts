import { Logger, type LoggerService, type OnModuleInit } from '@nestjs/common';
import type { Transporter } from 'nodemailer';

const SEND_TIMEOUT_MS = 10_000;

export interface SendEmailMessage {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly html?: string;
}

export interface SendEmailResult {
  readonly messageId: string;
}

export class EmailSendFailure extends Error {
  constructor(options: { cause?: unknown } = {}) {
    super('Não foi possível enviar o e-mail.', options);
    this.name = 'EmailSendFailure';
  }
}

class EmailSendTimeout extends Error {
  constructor() {
    super('SMTP send timeout');
    this.name = 'EmailSendTimeout';
  }
}

interface SmtpFailureDetails {
  readonly failureType: string;
  readonly smtpResponseCode?: number;
  readonly guidance?: string;
}

interface SmtpErrorLike {
  readonly code?: unknown;
  readonly response?: unknown;
  readonly responseCode?: unknown;
}

/** Serviço técnico reutilizável para envio transacional por SMTP. */
export class EmailService implements OnModuleInit {
  constructor(
    private readonly transporter: Transporter,
    private readonly from: string,
    private readonly logger: LoggerService = new Logger(EmailService.name),
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await withTimeout(this.transporter.verify(), SEND_TIMEOUT_MS);
      this.logger.log({ event: 'smtp_startup_check_succeeded' });
    } catch (error) {
      this.logger.error({
        event: 'smtp_startup_check_failed',
        ...describeFailure(error),
      });
    }
  }

  async send(message: SendEmailMessage): Promise<SendEmailResult> {
    if (!isValidSubject(message.subject)) {
      this.logger.error({
        event: 'email_send_failed',
        failureType: 'invalid_subject',
        recipient: maskEmailAddress(message.to),
      });
      throw new EmailSendFailure();
    }

    try {
      const abortController = new AbortController();
      const result = await withTimeout(
        this.transporter.sendMail({
          from: this.from,
          to: message.to,
          subject: message.subject,
          text: message.text,
          signal: abortController.signal,
          ...(message.html === undefined ? {} : { html: message.html }),
        }),
        SEND_TIMEOUT_MS,
        () => abortController.abort(),
      );
      const messageId = String(result.messageId);

      this.logger.log({
        event: 'email_sent',
        messageId,
        recipient: maskEmailAddress(message.to),
      });

      return { messageId };
    } catch (error) {
      this.logger.error({
        event: 'email_send_failed',
        ...describeFailure(error),
        recipient: maskEmailAddress(message.to),
      });
      throw new EmailSendFailure({ cause: error });
    }
  }
}

export function maskEmailAddress(address: string): string {
  const trimmed = address.trim();
  const separator = trimmed.lastIndexOf('@');
  const local = separator < 0 ? trimmed : trimmed.slice(0, separator);
  const domain = separator < 0 ? '' : trimmed.slice(separator + 1);
  const firstCharacter = [...local][0] ?? '*';

  return `${firstCharacter}***${domain === '' ? '' : `@${domain}`}`;
}

function isValidSubject(subject: string): boolean {
  return (
    subject.length >= 1 && subject.length <= 200 && !/[\r\n]/.test(subject)
  );
}

function describeFailure(error: unknown): SmtpFailureDetails {
  if (error instanceof EmailSendTimeout) {
    return { failureType: 'timeout' };
  }

  const smtpError = isObject(error) ? (error as SmtpErrorLike) : {};
  const code = typeof smtpError.code === 'string' ? smtpError.code : undefined;
  const responseCode =
    typeof smtpError.responseCode === 'number'
      ? smtpError.responseCode
      : undefined;
  const response =
    typeof smtpError.response === 'string' ? smtpError.response : '';

  if (response.includes('550 5.4.5')) {
    return {
      failureType: 'gmail_daily_quota',
      smtpResponseCode: responseCode,
      guidance: 'cota diária do Gmail esgotada',
    };
  }

  if (code === 'EAUTH' || responseCode === 534 || responseCode === 535) {
    return {
      failureType: 'authentication',
      smtpResponseCode: responseCode,
      guidance: 'a senha de app pode ter sido revogada',
    };
  }

  if (code === 'ETIMEDOUT') {
    return { failureType: 'timeout' };
  }

  if (responseCode !== undefined) {
    return { failureType: 'rejection', smtpResponseCode: responseCode };
  }

  if (
    code !== undefined &&
    ['ECONNECTION', 'ECONNREFUSED', 'ECONNRESET', 'EDNS'].includes(code)
  ) {
    return { failureType: 'connection' };
  }

  return { failureType: 'smtp' };
}

function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  onTimeout: () => void = () => undefined,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<never>((_resolve, reject) => {
    timeout = setTimeout(() => {
      onTimeout();
      reject(new EmailSendTimeout());
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timedOut]);
  } finally {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
  }
}
