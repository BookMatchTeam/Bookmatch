import type { IdGenerator } from '../application/id-generator.js';

/**
 * `IdGenerator` para testes: devolve os identificadores informados, na
 * ordem. Falha se o teste pedir mais identificadores do que preparou, para
 * que uma geração inesperada não passe despercebida.
 */
export class FixedIdGenerator implements IdGenerator {
  private readonly ids: string[];

  constructor(...ids: string[]) {
    this.ids = ids;
  }

  generate(): string {
    const id = this.ids.shift();

    if (id === undefined) {
      throw new Error('FixedIdGenerator: nenhum identificador restante');
    }

    return id;
  }
}
