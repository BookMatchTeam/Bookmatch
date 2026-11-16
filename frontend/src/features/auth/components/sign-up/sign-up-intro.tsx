export function SignUpIntro() {
  return (
    <>
      <section className="px-[7px] pt-[25px] pb-5">
        <p className="m-0 text-[10px] text-auth-accent tracking-[0.03em]">
          HISTÓRIAS BOAS MERECEM CIRCULAR
        </p>
        <h1 className="mt-[15px] mb-3 text-[27px] leading-[1.27] font-bold tracking-[-0.8px]">
          Sua estante encontra
          <br />
          novas companhias.
        </h1>
        <p className="my-2.5 text-[13px] leading-[1.6] text-auth-muted">
          Compartilhe livros físicos, descubra leitores por perto e faça parte
          de uma comunidade que lê junto.
        </p>
      </section>

      <img
        className="mx-auto my-3 block h-[140px] w-[270px] object-contain"
        src="/brand/bookmatch-login-top.svg"
        width="270"
        height="140"
        alt="Ilustração BookMatch: gato azul e livros"
      />
    </>
  )
}
