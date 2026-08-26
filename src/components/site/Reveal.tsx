import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

/**
 * Detecta quando o elemento entra na viewport (uma vez) e reporta via
 * IntersectionObserver. Usado por `Reveal` e por qualquer efeito que só deva
 * rodar quando visível (ex.: pausar partículas fora de tela).
 */
export function useInView<T extends Element>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      options ?? { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
}

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** atraso em ms, usado para escalonar cards de uma mesma grade */
  delay?: number;
};

export function Reveal({ children, as: Tag = "div", className = "", delay = 0 }: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? "reveal-visible" : ""} ${className}`}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}
