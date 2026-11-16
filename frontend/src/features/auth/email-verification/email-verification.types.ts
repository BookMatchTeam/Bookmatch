export interface VerifyEmailRequest {
  email: string
  code: string
}

export interface ResendVerificationCodeRequest {
  email: string
}
