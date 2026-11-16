import { ApiProperty } from '@nestjs/swagger';

export class SignUpResponseDto {
  @ApiProperty({
    example: 'ana@exemplo.com',
    description: 'E-mail normalizado que recebeu o código',
  })
  readonly email: string;
}
