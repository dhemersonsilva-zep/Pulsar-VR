import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle } from "lucide-react";
import { BUSINESS, stations, whatsappLink } from "@/lib/pulsar-data";

const links: { to: "/" | "/reservar"; hash?: string; label: string }[] = [
  { to: "/", label: "Início" },
  { to: "/", hash: "experiencias", label: "Experiências" },
  { to: "/", hash: "pacotes", label: "Pacotes" },
  { to: "/reservar", label: "Reservar" },
  { to: "/", hash: "localizacao", label: "Localização" },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-void py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="mb-6 font-display text-2xl font-black">
            <span className="text-neon-cyan">PULSAR</span> VR
          </div>
          <p className="max-w-sm text-muted-foreground">
            Sua arena gamer em {BUSINESS.cidade}/{BUSINESS.estado}. VR, PS5 e PC de alta performance
            em um ambiente imersivo — sua próxima experiência começa aqui.
          </p>
        </div>

        <div>
          <h4 className="mb-6 font-display text-sm font-bold uppercase tracking-widest">
            Experiências
          </h4>
          <ul className="space-y-3 text-muted-foreground">
            {stations.map((s) => (
              <li key={s.id}>
                <Link to="/" hash="experiencias" className="transition-colors hover:text-neon-cyan">
                  {s.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-6 font-display text-sm font-bold uppercase tracking-widest">
            Navegação
          </h4>
          <ul className="space-y-3 text-muted-foreground">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  {...(l.hash ? { hash: l.hash } : {})}
                  className="transition-colors hover:text-neon-cyan"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-border px-6 pt-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-4">
            <a
              href={whatsappLink("Olá! Vi o site da Pulsar VR e queria saber mais.")}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-neon-cyan"
            >
              <MessageCircle className="size-4" /> {BUSINESS.telefoneExibicao}
            </a>
            <a
              href={BUSINESS.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-neon-cyan"
            >
              <Instagram className="size-4" /> {BUSINESS.instagram}
            </a>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="border border-border px-2 py-1">PIX</span>
            <span className="border border-border px-2 py-1">CARTÃO</span>
            <span className="border border-border px-2 py-1">MERCADO PAGO</span>
          </div>
        </div>
        <p className="mt-8 text-center text-xs uppercase tracking-widest text-muted-foreground/50">
          © {new Date().getFullYear()} Pulsar VR — {BUSINESS.cidade}/{BUSINESS.estado}
        </p>
      </div>
    </footer>
  );
}
