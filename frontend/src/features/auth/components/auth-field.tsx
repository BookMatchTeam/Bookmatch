import type { ReactNode } from 'react'
import type { VariantProps } from 'class-variance-authority'

import {
  AuthInput,
  type AuthInputProps,
} from '@/features/auth/components/auth-input'
import { authInputVariants } from '@/features/auth/components/auth-input-variants'
import { cn } from '@/lib/utils'

type AuthFieldProps = Omit<AuthInputProps, 'size'> &
  VariantProps<typeof authInputVariants> & {
    id: string
    label: string
    hint?: string
    error?: string
    inputClassName?: string
    endAdornment?: ReactNode
  }

export function AuthField({
  id,
  label,
  hint,
  error,
  size = 'lg',
  className,
  inputClassName,
  endAdornment,
  'aria-describedby': ariaDescribedBy,
  ...props
}: AuthFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [ariaDescribedBy, hintId, errorId]
    .filter(Boolean)
    .join(' ') || undefined

  return (
    <div className={className}>
      <label
        className={cn(
          'block text-auth-label',
          size === 'md'
            ? 'mb-2 text-[11px]'
            : 'mb-[13px] text-xs leading-[18px] font-medium',
        )}
        htmlFor={id}
      >
        {label}
      </label>
      <div className="relative">
        <AuthInput
          {...props}
          id={id}
          size={size}
          className={inputClassName}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
        />
        {endAdornment}
      </div>
      {hint ? (
        <p
          className="my-2 text-[10px] leading-[1.6] text-auth-subtle"
          id={hintId}
        >
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          className="mt-2 mb-0 text-[11px] text-auth-danger"
          id={errorId}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}
