import type { PropsWithChildren } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type PagePlaceholderProps = PropsWithChildren<{
  eyebrow: string
  title: string
  description: string
}>

export function PagePlaceholder({
  eyebrow,
  title,
  description,
  children,
}: PagePlaceholderProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {eyebrow}
        </p>
        <CardTitle className="text-2xl sm:text-3xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      {children ? (
        <CardContent className="flex flex-wrap gap-2">{children}</CardContent>
      ) : null}
    </Card>
  )
}
