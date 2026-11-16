import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResendVerificationCodeUseCase } from '../../application/usecases/resend-verification-code/resend-verification-code.use-case.js';
import { ApiErrorResponses } from './api-error-responses.js';
import { ResendVerificationCodeRequestDto } from './dto/resend-verification-code.request.dto.js';

@ApiTags('auth')
@Controller('auth')
export class ResendVerificationCodeController {
  constructor(
    private readonly resendVerificationCode: ResendVerificationCodeUseCase,
  ) {}

  @Post('email-verification/resend')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Envia um novo código de verificação',
    description:
      'Responde 204 também para e-mails sem cadastro ou de contas já ' +
      'ativas, sem enviar nada, para não revelar quais contas existem.',
  })
  @ApiNoContentResponse({ description: 'Pedido aceito' })
  @ApiErrorResponses({
    [HttpStatus.UNPROCESSABLE_ENTITY]: ['VALIDATION_ERROR'],
    [HttpStatus.TOO_MANY_REQUESTS]: [
      'VERIFICATION_CODE_RESEND_TOO_SOON',
      'VERIFICATION_CODE_SEND_LIMIT_REACHED',
    ],
  })
  async resend(@Body() body: ResendVerificationCodeRequestDto): Promise<void> {
    await this.resendVerificationCode.execute(body);
  }
}
