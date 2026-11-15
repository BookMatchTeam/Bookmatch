import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'brand' | 'accent' | 'outline' | 'ghost'
  fullWidth?: boolean
}

export function Button({
  className,
  variant = 'primary',
  fullWidth = true,
  ...rest
}: ButtonProps) {
  const variantStyles = {
    brand:
      'bg-yellow text-navy-950 font-semibold shadow-md shadow-yellow/20 hover:bg-yellow/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 px-5 rounded-[10px]',
    accent:
      'bg-turquoise text-white font-semibold shadow-md shadow-turquoise/20 hover:bg-turquoise/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 px-5 rounded-[10px]',
    primary:
      'bg-navy text-white shadow-lg shadow-navy/20 hover:bg-navy-950 px-5 dark:ring-1 dark:ring-turquoise/50',
    secondary:
      'bg-surface border border-line/40 text-fg hover:bg-canvas hover:border-turquoise/50 px-4',
    outline:
      'border border-turquoise text-turquoise hover:bg-turquoise/10 px-4',
    ghost:
      'text-fg-2 hover:bg-surface hover:text-fg px-3',
  }


  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold whitespace-nowrap transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed',
        fullWidth ? 'w-full' : 'w-auto px-5',
        variantStyles[variant],
        className,
      )}
      {...rest}
    />
  )
}

