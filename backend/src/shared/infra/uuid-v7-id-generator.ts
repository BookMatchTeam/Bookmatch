import { v7 as uuidv7 } from 'uuid';
import type { IdGenerator } from '../application/id-generator.js';

/**
 * Identificadores UUID v7: os primeiros 48 bits são o horário de criação em
 * milissegundos, o que os torna ordenáveis no tempo e mantém as inserções no
 * fim do índice do banco.
 */
export class UuidV7IdGenerator implements IdGenerator {
  generate(): string {
    return uuidv7();
  }
}
