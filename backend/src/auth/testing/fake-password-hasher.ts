import type { Password } from '../application/entities/vo/password.vo.js';
import type { PasswordHasher } from '../application/usecases/create-account/password-hasher.gateway.js';

/** Hash previsível para testes: `hashed:<senha>`. */
export class FakePasswordHasher implements PasswordHasher {
  async hash(password: Password): Promise<string> {
    return `hashed:${password.value}`;
  }
}
