/**
 * Gera o identificador de uma entidade no momento em que ela é criada.
 *
 * A aplicação define o identificador, e não o banco, para que a entidade
 * nasça completa e para que os testes possam prever o valor gerado.
 */
export interface IdGenerator {
  generate(): string;
}
