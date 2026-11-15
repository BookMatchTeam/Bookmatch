import { useEffect, useState } from 'react'

interface Props {
  title: string
  text: string
  speed?: number
}

/** Digita o título e depois o texto, com cursor piscando no final. */
export function Typewriter({ title, text, speed = 35 }: Props) {
  const full = title + text
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [count, setCount] = useState(reduced ? full.length : 0)

  useEffect(() => {
    if (count >= full.length) return
    const delay = count === title.length ? 400 : speed
    const t = setTimeout(() => setCount((c) => c + 1), delay)
    return () => clearTimeout(t)
  }, [count, full.length, speed, title.length])

  const typedTitle = full.slice(0, Math.min(count, title.length))
  const typedText = count > title.length ? full.slice(title.length, count) : ''
  const cursor = <span className="ml-0.5 inline-block w-[2px] animate-[blink_1s_step-end_infinite] bg-current align-[-0.15em] h-[1em]" />

  return (
    <div aria-label={`${title} ${text}`}>
      <h2 aria-hidden className="mt-14 min-h-[1.2em] text-4xl font-semibold xl:text-5xl">
        {typedTitle}
        {count <= title.length && cursor}
      </h2>
      <p aria-hidden className="mt-4 min-h-[4.5em] max-w-md text-base text-fg-2 xl:max-w-lg xl:text-lg">
        {typedText}
        {count > title.length && cursor}
      </p>
    </div>
  )
}
