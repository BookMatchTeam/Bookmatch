import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateAccountUseCase } from '../../application/usecases/create-account/create-account.use-case.js';
import { ApiErrorResponses } from './api-error-responses.js';
import { SignUpRequestDto } from './dto/sign-up.request.dto.js';
import { SignUpResponseDto } from './dto/sign-up.response.dto.js';

@ApiTags('auth')
@Controller('auth')
export class CreateAccountController {
  constructor(private readonly createAccount: CreateAccountUseCase) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cria a conta e envia o código de verificação por e-mail',
    description:
      'A conta nasce pendente de verificação. Se o e-mail for de uma conta ' +
      'ainda pendente, o cadastro é refeito e um novo código é enviado.',
  })
  @ApiCreatedResponse({ type: SignUpResponseDto })
  @ApiErrorResponses({
    [HttpStatus.UNPROCESSABLE_ENTITY]: [
      'VALIDATION_ERROR',
      'INVALID_NAME',
      'INVALID_EMAIL',
      'INVALID_PASSWORD',
      'INVALID_CITY',
      'INVALID_STATE',
      'TERMS_NOT_ACCEPTED',
    ],
    [HttpStatus.CONFLICT]: ['EMAIL_ALREADY_REGISTERED'],
    [HttpStatus.TOO_MANY_REQUESTS]: [
      'VERIFICATION_CODE_RESEND_TOO_SOON',
      'VERIFICATION_CODE_SEND_LIMIT_REACHED (só no cadastro refeito)',
    ],
  })
  signUp(@Body() body: SignUpRequestDto): Promise<SignUpResponseDto> {
    return this.createAccount.execute(body);
  }
}
