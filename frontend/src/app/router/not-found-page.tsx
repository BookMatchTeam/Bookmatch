import { Link } from 'react-router'

import { paths } from '@/app/router/paths'
import { buttonVariants } from '@/components/ui/button'
import { PagePlaceholder } from '@/components/page-placeholder'

export function NotFoundPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-12">
      <PagePlaceholder
        eyebrow="Erro 404"
        title="Página não encontrada"
        description="O endereço informado não existe ou foi movido."
      >
        <Link className={buttonVariants()} to={paths.signIn}>
          Voltar ao início
        </Link>
      </PagePlaceholder>
    </main>
  )
}
