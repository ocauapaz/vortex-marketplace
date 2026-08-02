import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Conta de 0 até o valor quando o elemento entra na viewport. Escreve direto no
 * textContent em vez de passar por state: são ~60 atualizações por segundo e
 * re-renderizar o React em cada frame é desperdício.
 */
export function useCountUp(value: number) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const context = gsap.context(() => {
      const media = gsap.matchMedia()

      media.add('(prefers-reduced-motion: no-preference)', () => {
        const counter = { current: 0 }
        // O JSX já renderiza o número final (é o que sobra se o JS falhar);
        // zeramos aqui só quando a animação vai de fato acontecer.
        element.textContent = '0'

        gsap.to(counter, {
          current: value,
          duration: 1.4,
          ease: 'power2.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true },
          onUpdate: () => {
            element.textContent = new Intl.NumberFormat('pt-BR').format(
              Math.round(counter.current),
            )
          },
        })
      })

      media.add('(prefers-reduced-motion: reduce)', () => {
        element.textContent = new Intl.NumberFormat('pt-BR').format(value)
      })
    }, element)

    return () => context.revert()
  }, [value])

  return ref
}
