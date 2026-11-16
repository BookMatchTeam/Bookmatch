import { verify } from 'argon2';
import { Password } from '../../application/entities/vo/password.vo.js';
import { Argon2PasswordHasher } from './argon2-password-hasher.js';

describe('Argon2PasswordHasher', () => {
  const hasher = new Argon2PasswordHasher();

  it('gera um hash Argon2id que confere com a senha (CA-14)', async () => {
    const hash = await hasher.hash(Password.create('Senha@1234'));

    expect(hash).toMatch(/^\$argon2id\$/);
    expect(hash).not.toContain('Senha@1234');
    await expect(verify(hash, 'Senha@1234')).resolves.toBe(true);
    await expect(verify(hash, 'Senha@12345')).resolves.toBe(false);
  });

  it('gera hashes diferentes para a mesma senha (salt aleatório)', async () => {
    const password = Password.create('Senha@1234');

    expect(await hasher.hash(password)).not.toBe(await hasher.hash(password));
  });
});
