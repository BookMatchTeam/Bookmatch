import { useMutation } from '@tanstack/react-query'

import {
  resendVerificationCode,
  verifyEmail,
} from './email-verification.api'

export function useVerifyEmailMutation() {
  return useMutation({ mutationFn: verifyEmail })
}

export function useResendVerificationCodeMutation() {
  return useMutation({ mutationFn: resendVerificationCode })
}
