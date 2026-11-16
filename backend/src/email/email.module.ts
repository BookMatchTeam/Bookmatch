import { Module } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { APP_CONFIG, type AppConfig } from '../config/app-config.js';
import { EmailService } from './email.service.js';

export function createSmtpTransport(config: AppConfig['mail']) {
  return createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.auth.user,
      pass: config.auth.password,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  });
}

@Module({
  providers: [
    {
      provide: EmailService,
      useFactory: (config: AppConfig) =>
        new EmailService(createSmtpTransport(config.mail), config.mail.from),
      inject: [APP_CONFIG],
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
