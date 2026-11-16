import { apiClient } from '@/services/api'

import type {
  ResendVerificationCodeRequest,
  VerifyEmailRequest,
} from './email-verification.types'

export function verifyEmail(body: VerifyEmailRequest) {
  return apiClient.post<void>('api/auth/email-verification', body)
}

export function resendVerificationCode(
  body: ResendVerificationCodeRequest,
) {
  return apiClient.post<void>('api/auth/email-verification/resend', body)
}
