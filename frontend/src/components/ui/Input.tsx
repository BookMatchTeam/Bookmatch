import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, Props>(({ label, error, id, className, ...rest }, ref) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className="text-xs font-medium sm:text-sm text-navy-950 dark:text-cyan-50">
      {label}
    </label>
    <input
      ref={ref}
      id={id}
      aria-invalid={!!error}
      className={cn(
        'h-11 rounded-lg border bg-white px-4 text-sm text-navy-950 placeholder:text-muted outline-none transition focus:ring-2 focus:ring-turquoise/40 dark:bg-navy-950/80 dark:text-cyan-50 dark:placeholder:text-muted/60 dark:border-line/40 dark:focus:border-turquoise dark:focus:ring-turquoise/30',
        error ? 'border-error' : 'border-line focus:border-turquoise',
        className,
      )}
      {...rest}
    />
    {error && <span className="text-xs text-error">{error}</span>}
  </div>

))
Input.displayName = 'Input'
