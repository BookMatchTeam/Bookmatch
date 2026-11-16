import { useMutation } from '@tanstack/react-query'

import { signUp } from './sign-up.api'

export function useSignUpMutation() {
  return useMutation({ mutationFn: signUp })
}
