import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class VerifyEmailRequestDto {
  @ApiProperty({ example: 'ana@exemplo.com' })
  @IsString()
  readonly email: string;

  @ApiProperty({
    example: '042317',
    description: 'Exatamente 6 dígitos. Fora do formato, a tentativa não conta',
    pattern: '^\\d{6}$',
  })
  @IsString()
  @Matches(/^\d{6}$/)
  readonly code: string;
}
