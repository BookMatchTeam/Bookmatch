import { z } from 'zod'

export const emailVerificationSchema = z.object({
  code: z
    .string()
    .regex(/^\d{6}$/, 'Informe os 6 dígitos do código.'),
})

export type EmailVerificationFormData = z.infer<
  typeof emailVerificationSchema
>
