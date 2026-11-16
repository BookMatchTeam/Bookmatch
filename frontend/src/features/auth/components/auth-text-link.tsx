import type { ComponentProps } from 'react'
import { Link } from 'react-router'

import { cn } from '@/lib/utils'

export function AuthTextLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        'text-xs font-semibold text-auth-link no-underline hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auth-focus',
        className,
      )}
      {...props}
    />
  )
}
