import { z } from 'zod'

export const loginSchema = z.object({
  login: z.string().min(1, 'Informe seu usuário ou e-mail'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

export type LoginForm = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  nome: z.string().min(2, 'Informe seu nome completo ou como gosta de ser chamado'),
  email: z.string().email('Informe um e-mail válido'),
  senha: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  cidade: z.string().min(2, 'Informe sua cidade'),
  bairro: z.string().min(2, 'Informe seu bairro'),
  termos: z.boolean().refine((val) => val === true, {
    message: 'Você precisa aceitar os termos de uso e privacidade',
  }),
})

export type RegisterForm = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
})

export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

