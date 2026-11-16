export interface SignUpRequest {
  name: string
  email: string
  password: string
  city: string
  state: string
  acceptedTerms: true
}

export interface SignUpResponse {
  email: string
}
