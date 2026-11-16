import { argon2id, hash } from 'argon2';
import type { Password } from '../../application/entities/vo/password.vo.js';
import type { PasswordHasher } from '../../application/usecases/create-account/password-hasher.gateway.js';

/** Hash Argon2id com os parâmetros padrão da biblioteca (RN-10). */
export class Argon2PasswordHasher implements PasswordHasher {
  hash(password: Password): Promise<string> {
    return hash(password.value, { type: argon2id });
  }
}
