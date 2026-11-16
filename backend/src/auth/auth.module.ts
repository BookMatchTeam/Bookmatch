import { Module } from '@nestjs/common';
import type { Clock } from '../shared/application/clock.js';
import type { IdGenerator } from '../shared/application/id-generator.js';
import { CLOCK, ID_GENERATOR } from '../shared/infra/shared.module.js';
import { APP_CONFIG, type AppConfig } from '../config/app-config.js';
import type { VerificationCodeGenerator } from './application/gateways/verification-code-generator.gateway.js';
import type { VerificationCodeHasher } from './application/gateways/verification-code-hasher.gateway.js';
import type { VerificationCodeMailer } from './application/gateways/verification-code-mailer.gateway.js';
import type { CreateAccountGateway } from './application/usecases/create-account/create-account.gateway.js';
import { CreateAccountUseCase } from './application/usecases/create-account/create-account.use-case.js';
import type { PasswordHasher } from './application/usecases/create-account/password-hasher.gateway.js';
import type { ResendVerificationCodeGateway } from './application/usecases/resend-verification-code/resend-verification-code.gateway.js';
import { ResendVerificationCodeUseCase } from './application/usecases/resend-verification-code/resend-verification-code.use-case.js';
import type { VerifyEmailGateway } from './application/usecases/verify-email/verify-email.gateway.js';
import { VerifyEmailUseCase } from './application/usecases/verify-email/verify-email.use-case.js';
import {
  CREATE_ACCOUNT_GATEWAY,
  PASSWORD_HASHER,
  RESEND_VERIFICATION_CODE_GATEWAY,
  VERIFICATION_CODE_GENERATOR,
  VERIFICATION_CODE_HASHER,
  VERIFICATION_CODE_MAILER,
  VERIFY_EMAIL_GATEWAY,
} from './infra/auth.tokens.js';
import { Argon2PasswordHasher } from './infra/crypto/argon2-password-hasher.js';
import { HmacVerificationCodeHasher } from './infra/crypto/hmac-verification-code-hasher.js';
import { RandomVerificationCodeGenerator } from './infra/crypto/random-verification-code-generator.js';
import { CreateAccountController } from './infra/http/create-account.controller.js';
import { ResendVerificationCodeController } from './infra/http/resend-verification-code.controller.js';
import { VerifyEmailController } from './infra/http/verify-email.controller.js';
import {
  createSmtpTransport,
  SmtpVerificationCodeMailer,
} from './infra/mail/smtp-verification-code-mailer.js';
import { PrismaCreateAccountGateway } from './infra/persistence/prisma/prisma-create-account.gateway.js';
import { PrismaResendVerificationCodeGateway } from './infra/persistence/prisma/prisma-resend-verification-code.gateway.js';
import { PrismaVerifyEmailGateway } from './infra/persistence/prisma/prisma-verify-email.gateway.js';

@Module({
  controllers: [
    CreateAccountController,
    VerifyEmailController,
    ResendVerificationCodeController,
  ],
  providers: [
    { provide: CREATE_ACCOUNT_GATEWAY, useClass: PrismaCreateAccountGateway },
    { provide: VERIFY_EMAIL_GATEWAY, useClass: PrismaVerifyEmailGateway },
    {
      provide: RESEND_VERIFICATION_CODE_GATEWAY,
      useClass: PrismaResendVerificationCodeGateway,
    },
    { provide: PASSWORD_HASHER, useClass: Argon2PasswordHasher },
    {
      provide: VERIFICATION_CODE_GENERATOR,
      useClass: RandomVerificationCodeGenerator,
    },
    {
      provide: VERIFICATION_CODE_HASHER,
      useFactory: (config: AppConfig) =>
        new HmacVerificationCodeHasher(config.verificationCode.secret),
      inject: [APP_CONFIG],
    },
    {
      provide: VERIFICATION_CODE_MAILER,
      useFactory: (config: AppConfig) =>
        new SmtpVerificationCodeMailer(
          createSmtpTransport(config.mail),
          config.mail.from,
        ),
      inject: [APP_CONFIG],
    },
    {
      provide: CreateAccountUseCase,
      useFactory: (
        gateway: CreateAccountGateway,
        passwordHasher: PasswordHasher,
        codeGenerator: VerificationCodeGenerator,
        codeHasher: VerificationCodeHasher,
        mailer: VerificationCodeMailer,
        idGenerator: IdGenerator,
        clock: Clock,
        config: AppConfig,
      ) =>
        new CreateAccountUseCase({
          gateway,
          passwordHasher,
          codeGenerator,
          codeHasher,
          mailer,
          idGenerator,
          clock,
          termsVersion: config.terms.version,
        }),
      inject: [
        CREATE_ACCOUNT_GATEWAY,
        PASSWORD_HASHER,
        VERIFICATION_CODE_GENERATOR,
        VERIFICATION_CODE_HASHER,
        VERIFICATION_CODE_MAILER,
        ID_GENERATOR,
        CLOCK,
        APP_CONFIG,
      ],
    },
    {
      provide: VerifyEmailUseCase,
      useFactory: (
        gateway: VerifyEmailGateway,
        codeHasher: VerificationCodeHasher,
        clock: Clock,
      ) => new VerifyEmailUseCase({ gateway, codeHasher, clock }),
      inject: [VERIFY_EMAIL_GATEWAY, VERIFICATION_CODE_HASHER, CLOCK],
    },
    {
      provide: ResendVerificationCodeUseCase,
      useFactory: (
        gateway: ResendVerificationCodeGateway,
        codeGenerator: VerificationCodeGenerator,
        codeHasher: VerificationCodeHasher,
        mailer: VerificationCodeMailer,
        idGenerator: IdGenerator,
        clock: Clock,
      ) =>
        new ResendVerificationCodeUseCase({
          gateway,
          codeGenerator,
          codeHasher,
          mailer,
          idGenerator,
          clock,
        }),
      inject: [
        RESEND_VERIFICATION_CODE_GATEWAY,
        VERIFICATION_CODE_GENERATOR,
        VERIFICATION_CODE_HASHER,
        VERIFICATION_CODE_MAILER,
        ID_GENERATOR,
        CLOCK,
      ],
    },
  ],
})
export class AuthModule {}
