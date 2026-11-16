import { Global, Module } from '@nestjs/common';
import { SystemClock } from './system-clock.js';
import { UuidV7IdGenerator } from './uuid-v7-id-generator.js';

/** Token de injeção do contrato `IdGenerator`. */
export const ID_GENERATOR = Symbol('ID_GENERATOR');

/** Token de injeção do contrato `Clock`. */
export const CLOCK = Symbol('CLOCK');

/**
 * Fornece as implementações reais dos contratos compartilhados. Os módulos de
 * domínio as repassam aos casos de uso pelo `inject` de seus `useFactory`.
 */
@Global()
@Module({
  providers: [
    { provide: ID_GENERATOR, useClass: UuidV7IdGenerator },
    { provide: CLOCK, useClass: SystemClock },
  ],
  exports: [ID_GENERATOR, CLOCK],
})
export class SharedModule {}
