import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

/**
 * O DTO confere só presença e tipo. As regras de cada campo ficam nos value
 * objects e respondem com o código da regra (`INVALID_NAME`...).
 */
export class SignUpRequestDto {
  @ApiProperty({
    example: 'Ana Souza',
    description: 'De 2 a 100 caracteres, sem contar os espaços das pontas',
  })
  @IsString()
  readonly name: string;

  @ApiProperty({
    example: 'ana@exemplo.com',
    description: 'Até 254 caracteres. Salvo sem espaços e em minúsculas',
  })
  @IsString()
  readonly email: string;

  @ApiProperty({
    example: 'senha1234',
    description: 'De 8 a 128 caracteres, com pelo menos uma letra e um número',
  })
  @IsString()
  readonly password: string;

  @ApiProperty({
    example: 'São Paulo',
    description: 'De 2 a 100 caracteres, sem contar os espaços das pontas',
  })
  @IsString()
  readonly city: string;

  @ApiProperty({
    example: 'SP',
    description: 'Sigla da UF, em maiúsculas ou minúsculas',
  })
  @IsString()
  readonly state: string;

  @ApiProperty({
    example: true,
    description: 'Aceite dos termos de uso e da política de privacidade',
  })
  @IsBoolean()
  readonly acceptedTerms: boolean;
}
