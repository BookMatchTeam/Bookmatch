import { ApiProperty } from '@nestjs/swagger';

/**
 * Formato único de toda resposta de erro da API.
 */
export class ApiErrorResponse {
  @ApiProperty({ description: 'Status HTTP da resposta', example: 409 })
  readonly statusCode: number;

  @ApiProperty({
    description: 'Código estável do erro, para o cliente decidir o que fazer',
    example: 'EMAIL_ALREADY_REGISTERED',
  })
  readonly code: string;

  @ApiProperty({
    description: 'Mensagem segura para exibir ao usuário',
    example: 'Este e-mail já está cadastrado.',
  })
  readonly message: string;
}
