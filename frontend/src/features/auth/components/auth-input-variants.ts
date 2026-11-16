import { cva } from 'class-variance-authority'

export const authInputVariants = cva(
  'w-full border border-auth-border bg-auth-surface text-base text-auth-ink outline-none transition placeholder:text-auth-subtle focus:border-auth-focus aria-invalid:border-auth-danger',
  {
    variants: {
      size: {
        lg: 'h-14 rounded-xl px-[15px] focus:ring-[3px] focus:ring-auth-focus-ring/12',
        md: 'h-[49px] rounded-[7px] px-3.5 focus:ring-2 focus:ring-auth-focus/20',
      },
    },
    defaultVariants: {
      size: 'lg',
    },
  },
)
