import { apiClient } from '@/services/api'

import type { SignUpRequest, SignUpResponse } from './sign-up.types'

export function signUp(body: SignUpRequest) {
  return apiClient.post<SignUpResponse>('api/auth/sign-up', body)
}
