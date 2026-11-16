import { ShieldCheck } from 'lucide-react'

export function SignUpFooter() {
  return (
    <>
      <section className="mt-6 flex gap-[13px] border-t border-auth-divider py-6">
        <img
          className="h-[95px] w-[100px] shrink-0 object-contain"
          src="/brand/bookmatch-login-bottom.svg"
          width="100"
          height="95"
          alt="Gato amarelo e livros"
        />
        <div>
          <h2 className="m-0 text-sm font-bold">
            Mais leituras. Mais encontros.
          </h2>
          <p className="my-2.5 text-[11px] leading-[1.6] text-auth-muted">
            Empréstimos, doações e trocas. Cada livro, uma nova história.
          </p>
        </div>
      </section>

      <footer className="px-2.5 py-3 text-[10px] leading-[1.7] text-auth-subtle">
        <ShieldCheck
          aria-hidden="true"
          className="size-[29px] text-auth-accent"
          strokeWidth={1.6}
        />
        <p className="my-2.5 text-[10px] leading-[1.7] text-auth-subtle">
          Livros físicos, sem pagamentos. Combine entregas em locais públicos e
          pelo chat.
        </p>
        <span>Acesso à plataforma BookMatch.</span>
      </footer>
    </>
  )
}
