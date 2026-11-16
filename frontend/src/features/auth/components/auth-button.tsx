import type { ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const authButtonVariants = cva(
  'inline-flex w-full items-center justify-center border-0 font-semibold transition focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-auth-focus-outline active:translate-y-px disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-auth-primary text-white hover:bg-auth-primary-hover',
        social:
          'bg-auth-social-surface text-auth-ink hover:-translate-y-px hover:bg-auth-social-hover',
      },
      size: {
        lg: 'h-[55px] rounded-xl text-base',
        md: 'h-[45px] rounded-[7px] text-xs',
      },
    },
    compoundVariants: [
      {
        variant: 'primary',
        size: 'lg',
        className: 'shadow-[var(--auth-button-shadow)]',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'lg',
    },
  },
)

type AuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof authButtonVariants>

export function AuthButton({
  className,
  variant,
  size,
  ...props
}: AuthButtonProps) {
  return (
    <button
      className={cn(authButtonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
