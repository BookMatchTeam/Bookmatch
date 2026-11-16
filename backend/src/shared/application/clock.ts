/**
 * Fonte do horário atual para as regras da aplicação.
 *
 * Casos de uso e entidades recebem o horário por este contrato em vez de
 * chamar `new Date()`, para que regras dependentes de tempo (expiração,
 * prazos, intervalos entre tentativas) possam ser testadas sem esperar.
 */
export interface Clock {
  now(): Date;
}
