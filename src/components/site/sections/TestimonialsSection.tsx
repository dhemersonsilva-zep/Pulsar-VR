import { MessageSquareHeart } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { BUSINESS, whatsappLink } from "@/lib/pulsar-data";

export type Depoimento = {
  nome: string;
  texto: string;
  experiencia: string;
};

/**
 * Array vazio de propósito: regra do briefing é não inventar avaliações.
 * Quando houver depoimentos reais, adicione aqui — a seção troca
 * automaticamente do estado vazio para a grade de cards.
 */
export const depoimentos: Depoimento[] = [];

export function TestimonialsSection() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="Depoimentos" title="O QUE A GALERA ACHOU" accent="pink" />

        {depoimentos.length === 0 ? (
          <Reveal className="glass-card mx-auto max-w-lg p-10 text-center">
            <MessageSquareHeart className="mx-auto mb-4 size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Ainda não temos avaliações públicas por aqui. Já jogou na Pulsar? Manda sua opinião
              pelo Instagram {BUSINESS.instagram} ou pelo WhatsApp.
            </p>
            <a
              href={whatsappLink("Olá! Quero deixar minha avaliação sobre a Pulsar VR.")}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-block border border-border px-6 py-3 font-display text-xs font-bold uppercase tracking-widest transition-all hover:border-neon-cyan hover:text-neon-cyan"
            >
              Deixar avaliação
            </a>
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {depoimentos.map((d, i) => (
              <Reveal key={d.nome} delay={i * 100} className="glass-card p-6">
                <p className="text-sm text-muted-foreground">&ldquo;{d.texto}&rdquo;</p>
                <p className="mt-4 font-display text-sm font-bold">{d.nome}</p>
                <p className="text-xs text-muted-foreground">{d.experiencia}</p>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
