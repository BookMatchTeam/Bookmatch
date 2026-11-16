import type { Password } from '../../entities/vo/password.vo.js';

/** Gera o hash da senha, que é a única forma em que ela é guardada (RN-10). */
export interface PasswordHasher {
  hash(password: Password): Promise<string>;
}
