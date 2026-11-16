import { z } from 'zod'

import { brazilianStates } from '@/shared/constants/brazilian-states'

const validStateCodes = new Set<string>(
  brazilianStates.map(({ uf }) => uf),
)

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Informe seu nome com pelo menos 2 caracteres.')
    .max(100, 'O nome pode ter no máximo 100 caracteres.'),
  email: z
    .string()
    .trim()
    .min(1, 'Informe seu e-mail.')
    .max(254, 'O e-mail pode ter no máximo 254 caracteres.')
    .email('Informe um e-mail válido.')
    .transform((email) => email.toLowerCase()),
  password: z
    .string()
    .min(8, 'A senha precisa ter pelo menos 8 caracteres.')
    .max(128, 'A senha pode ter no máximo 128 caracteres.')
    .regex(/[A-Za-z]/, 'A senha precisa ter pelo menos uma letra.')
    .regex(/\d/, 'A senha precisa ter pelo menos um número.'),
  city: z
    .string()
    .trim()
    .min(2, 'Informe uma cidade com pelo menos 2 caracteres.')
    .max(100, 'A cidade pode ter no máximo 100 caracteres.'),
  state: z
    .string()
    .trim()
    .transform((state) => state.toUpperCase())
    .refine((state) => validStateCodes.has(state), 'Selecione um estado.'),
  acceptedTerms: z
    .boolean()
    .refine((accepted) => accepted, 'Você precisa aceitar os termos.')
    .transform(() => true as const),
})

export type SignUpFormInput = z.input<typeof signUpSchema>
export type SignUpFormData = z.output<typeof signUpSchema>
