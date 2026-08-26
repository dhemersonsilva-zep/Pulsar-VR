import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Início" },
  { to: "/reservar", label: "Estações" },
  { to: "/loja", label: "Loja" },
  { to: "/contato", label: "Contato" },
] as const;

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
      className={`fixed inset-x-0 top-0 z-50 border-b border-border backdrop-blur-md transition-shadow ${
        scrolled ? "bg-background/90 shadow-[0_4px_30px_rgba(0,0,0,0.6)]" : "bg-background/70"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-2xl font-black tracking-tighter">
          <span className="text-neon-cyan">PULSAR</span>
          <span className="text-foreground"> VR</span>
        </Link>

        <div className="hidden gap-8 text-sm font-medium uppercase tracking-widest md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-muted-foreground transition-colors hover:text-neon-cyan"
              activeProps={{ className: "text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/reservar"
            className="btn-skew hidden bg-neon-cyan px-6 py-2 font-display text-xs font-bold text-primary-foreground transition-all hover:brightness-110 md:inline-block"
          >
            <span className="btn-skew-inner">RESERVAR AGORA</span>
          </Link>
          <button
            type="button"
            aria-label="Abrir menu"
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
                key={l.to}
                to={l.to}
                onClick={() => setAberto(false)}
                className="text-muted-foreground transition-colors hover:text-neon-cyan"
              >
                {l.label}
              </Link>
            ))}
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
