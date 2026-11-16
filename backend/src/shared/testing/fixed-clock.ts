import type { Clock } from '../application/clock.js';

export interface Duration {
  readonly days?: number;
  readonly hours?: number;
  readonly minutes?: number;
  readonly seconds?: number;
  readonly milliseconds?: number;
}

const MILLISECONDS = {
  days: 86_400_000,
  hours: 3_600_000,
  minutes: 60_000,
  seconds: 1_000,
  milliseconds: 1,
} as const satisfies Record<keyof Duration, number>;

/**
 * `Clock` para testes: o horário só muda quando o teste pede, com `advance`
 * ou `set`.
 */
export class FixedClock implements Clock {
  private current: number;

  constructor(start: Date) {
    this.current = start.getTime();
  }

  now(): Date {
    return new Date(this.current);
  }

  advance(duration: Duration): void {
    for (const [unit, factor] of Object.entries(MILLISECONDS)) {
      this.current += (duration[unit as keyof Duration] ?? 0) * factor;
    }
  }

  set(date: Date): void {
    this.current = date.getTime();
  }
}
