import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VerifyEmailUseCase } from '../../application/usecases/verify-email/verify-email.use-case.js';
import { ApiErrorResponses } from './api-error-responses.js';
import { VerifyEmailRequestDto } from './dto/verify-email.request.dto.js';

@ApiTags('auth')
@Controller('auth')
export class VerifyEmailController {
  constructor(private readonly verifyEmail: VerifyEmailUseCase) {}

  @Post('email-verification')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Confere o código enviado por e-mail e ativa a conta',
  })
  @ApiNoContentResponse({ description: 'Conta ativada' })
  @ApiErrorResponses({
    [HttpStatus.UNPROCESSABLE_ENTITY]: [
      'VALIDATION_ERROR',
      'INVALID_VERIFICATION_CODE',
      'VERIFICATION_CODE_EXPIRED',
      'VERIFICATION_CODE_ATTEMPTS_EXCEEDED',
    ],
    [HttpStatus.CONFLICT]: ['EMAIL_ALREADY_VERIFIED'],
  })
  async verify(@Body() body: VerifyEmailRequestDto): Promise<void> {
    await this.verifyEmail.execute(body);
  }
}
