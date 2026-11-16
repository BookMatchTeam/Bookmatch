import { FixedClock } from './fixed-clock.js';

describe('FixedClock', () => {
  const start = new Date('2026-11-16T10:00:00.000Z');

  it('retorna sempre o horário definido', () => {
    const clock = new FixedClock(start);

    expect(clock.now()).toEqual(start);
    expect(clock.now()).toEqual(start);
  });

  it('não é afetado por alterações na data recebida ou devolvida', () => {
    const initial = new Date(start);
    const clock = new FixedClock(initial);

    initial.setFullYear(2000);
    clock.now().setFullYear(2000);

    expect(clock.now()).toEqual(start);
  });

  it('avança o tempo pela duração informada', () => {
    const clock = new FixedClock(start);

    clock.advance({
      days: 1,
      hours: 2,
      minutes: 30,
      seconds: 15,
      milliseconds: 5,
    });

    expect(clock.now()).toEqual(new Date('2026-11-17T12:30:15.005Z'));
  });

  it('acumula avanços sucessivos', () => {
    const clock = new FixedClock(start);

    clock.advance({ minutes: 20 });
    clock.advance({ minutes: 11 });

    expect(clock.now()).toEqual(new Date('2026-11-16T10:31:00.000Z'));
  });

  it('define um novo horário', () => {
    const clock = new FixedClock(start);
    const later = new Date('2026-12-01T00:00:00.000Z');

    clock.set(later);

    expect(clock.now()).toEqual(later);
  });
});
