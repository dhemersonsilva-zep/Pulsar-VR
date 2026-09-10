import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Rocket, X } from "lucide-react";

const links: { to: "/" | "/loja"; hash?: string; label: string }[] = [
  { to: "/", label: "Início" },
  { to: "/", hash: "experiencias", label: "Experiências" },
  { to: "/", hash: "pacotes", label: "Pacotes" },
  { to: "/", hash: "creditos", label: "Créditos" },
  { to: "/", hash: "como-funciona", label: "Como funciona" },
  { to: "/", hash: "localizacao", label: "Localização" },
  { to: "/loja", label: "Loja" },
];

export function SiteNav() {
  const [aberto, setAberto] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all ${
        scrolled
          ? "border-border bg-background/85 shadow-[0_4px_30px_rgba(0,0,0,0.6)] backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-2xl font-black tracking-tighter">
          <span className="text-neon-cyan">PULSAR</span>
          <span className="text-foreground"> VR</span>
        </Link>

        <div className="hidden gap-5 text-sm font-medium uppercase tracking-widest md:flex lg:gap-8">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              {...(l.hash ? { hash: l.hash } : {})}
              className="text-muted-foreground transition-colors hover:text-neon-cyan"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: true, includeHash: false }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Área pessoal: fica no cluster da direita, junto do CTA, em vez de
              disputar espaço com a navegação do site. */}
          <Link
            to="/hub"
            aria-label="Meu Império"
            className="hidden items-center gap-1.5 border border-neon-purple/50 px-3 py-2 font-display text-xs font-bold uppercase tracking-widest text-neon-purple transition-all hover:bg-neon-purple/10 md:inline-flex lg:px-4"
          >
            <Rocket className="size-3.5" />
            {/* Só o ícone em telas médias, onde a navegação já está apertada. */}
            <span className="hidden lg:inline">Meu Império</span>
          </Link>
          <Link
            to="/reservar"
            className="btn-skew hidden bg-neon-cyan px-6 py-2 font-display text-xs font-bold text-primary-foreground transition-all hover:brightness-110 md:inline-block"
          >
            <span className="btn-skew-inner">RESERVAR AGORA</span>
          </Link>
          <button
            type="button"
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={aberto}
            onClick={() => setAberto((v) => !v)}
            className="text-foreground md:hidden"
          >
            {aberto ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {aberto && (
        <div className="border-t border-border bg-background px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4 text-sm font-medium uppercase tracking-widest">
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                {...(l.hash ? { hash: l.hash } : {})}
                onClick={() => setAberto(false)}
                className="text-muted-foreground transition-colors hover:text-neon-cyan"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/hub"
              onClick={() => setAberto(false)}
              className="flex items-center gap-2 text-neon-purple transition-colors hover:brightness-110"
            >
              <Rocket className="size-4" />
              Meu Império
            </Link>
            <Link
              to="/reservar"
              onClick={() => setAberto(false)}
              className="btn-skew mt-2 bg-neon-cyan px-6 py-3 text-center font-display text-xs font-bold text-primary-foreground"
            >
              <span className="btn-skew-inner">RESERVAR AGORA</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
