import { Link } from 'react-router'

import { paths } from '@/app/router/paths'
import { buttonVariants } from '@/components/ui/button'
import { PagePlaceholder } from '@/shared/components/page-placeholder'

export function SignInPage() {
  return (
    <PagePlaceholder
      eyebrow="Acesso"
      title="Entrar"
      description="O formulário de autenticação será implementado no primeiro fluxo do produto."
    >
      <Link className={buttonVariants()} to={paths.signUp}>
        Criar conta
      </Link>
      <Link
        className={buttonVariants({ variant: 'outline' })}
        to={paths.recoverPassword}
      >
        Recuperar senha
      </Link>
    </PagePlaceholder>
  )
}

export function SignUpPage() {
  return (
    <PagePlaceholder
      eyebrow="Cadastro"
      title="Criar conta"
      description="O cadastro será conectado à API quando iniciarmos o fluxo de autenticação."
    >
      <Link className={buttonVariants({ variant: 'outline' })} to={paths.signIn}>
        Já tenho uma conta
      </Link>
    </PagePlaceholder>
  )
}

export function RecoverPasswordPage() {
  return (
    <PagePlaceholder
      eyebrow="Acesso"
      title="Recuperar senha"
      description="A recuperação de acesso será implementada junto à autenticação."
    >
      <Link className={buttonVariants({ variant: 'outline' })} to={paths.signIn}>
        Voltar para entrar
      </Link>
    </PagePlaceholder>
  )
}
