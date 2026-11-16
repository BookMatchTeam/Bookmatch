import type { InputHTMLAttributes } from 'react'
import type { VariantProps } from 'class-variance-authority'

import { authInputVariants } from '@/features/auth/components/auth-input-variants'
import { cn } from '@/lib/utils'

export type AuthInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> &
  VariantProps<typeof authInputVariants>

export function AuthInput({ className, size, ...props }: AuthInputProps) {
  return (
    <input
      className={cn(authInputVariants({ size }), className)}
      {...props}
    />
  )
}
