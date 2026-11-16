import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { AuthField } from '@/features/auth/components/auth-field'
import type { AuthInputProps } from '@/features/auth/components/auth-input'
import { cn } from '@/lib/utils'

type PasswordFieldProps = Omit<AuthInputProps, 'size' | 'type'> & {
  id: string
  label: string
  hint?: string
  error?: string
  size?: 'lg' | 'md'
}

export function PasswordField({
  size = 'lg',
  className,
  ...props
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <AuthField
      {...props}
      size={size}
      type={showPassword ? 'text' : 'password'}
      className={className}
      inputClassName="pr-12"
      endAdornment={
        <button
          className={cn(
            'absolute inset-y-0 right-0 flex w-12 items-center justify-center text-auth-muted transition hover:text-auth-accent focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-auth-focus',
            size === 'md' ? 'rounded-r-[7px]' : 'rounded-r-xl',
          )}
          type="button"
          onClick={() => setShowPassword((visible) => !visible)}
          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={showPassword}
        >
          {showPassword ? (
            <EyeOff aria-hidden="true" className="size-[18px]" />
          ) : (
            <Eye aria-hidden="true" className="size-[18px]" />
          )}
        </button>
      }
    />
  )
}
