import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ResendVerificationCodeRequestDto {
  @ApiProperty({ example: 'ana@exemplo.com' })
  @IsString()
  readonly email: string;
}
