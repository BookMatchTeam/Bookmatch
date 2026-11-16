import { Test } from '@nestjs/testing';
import { CLOCK, ID_GENERATOR, SharedModule } from './shared.module.js';
import { SystemClock } from './system-clock.js';
import { UuidV7IdGenerator } from './uuid-v7-id-generator.js';

describe('SharedModule', () => {
  it('fornece as implementações reais de IdGenerator e Clock', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [SharedModule],
    }).compile();

    expect(moduleRef.get(ID_GENERATOR)).toBeInstanceOf(UuidV7IdGenerator);
    expect(moduleRef.get(CLOCK)).toBeInstanceOf(SystemClock);
  });
});
