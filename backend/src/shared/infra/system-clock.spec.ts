import { SystemClock } from './system-clock.js';

describe('SystemClock', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('retorna o horário atual do sistema', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-16T10:00:00.000Z'));

    expect(new SystemClock().now()).toEqual(
      new Date('2026-11-16T10:00:00.000Z'),
    );
  });

  it('retorna uma nova instância a cada chamada', () => {
    const clock = new SystemClock();

    expect(clock.now()).not.toBe(clock.now());
  });
});
