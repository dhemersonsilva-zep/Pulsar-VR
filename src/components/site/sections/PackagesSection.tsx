import { Link } from "@tanstack/react-router";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { TiltCard } from "@/components/site/TiltCard";
import { pacotes, precoBRL, precoPacote, whatsappLink } from "@/lib/pulsar-data";

export function PackagesSection() {
  return (
    <section id="pacotes" className="relative scroll-mt-24 bg-card/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Pacotes Pulsar"
          title="ENCONTRE O SEU FORMATO"
          subtitle="Do solo ao aniversário em grupo — o preço é calculado a partir do valor real por hora de cada estação."
          accent="pink"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pacotes.map((p, i) => (
            <Reveal key={p.id} delay={i * 100}>
              <TiltCard className="tilt-glow h-full">
                <div
                  className={`glass-panel flex h-full flex-col p-6 ${
                    p.destaque ? "border-neon-pink/50" : ""
                  }`}
                >
                  {p.destaque && (
                    <span className="mb-4 inline-block w-fit bg-neon-pink px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                      Melhor custo-benefício
                    </span>
                  )}
                  <h3 className="font-display text-xl font-bold">{p.nome}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.tagline}</p>

                  <div className="mt-6 border-t border-border pt-4">
                    {p.sobConsulta ? (
                      <p className="font-display text-lg font-bold text-neon-purple">
                        Sob consulta
                      </p>
                    ) : (
                      <p className="font-display text-2xl font-bold text-neon-cyan">
                        {precoBRL(precoPacote(p))}
                        <span className="text-xs font-normal text-muted-foreground">
                          {" "}
                          / {p.duracaoHoras}h · {p.pessoas} {p.pessoas > 1 ? "pessoas" : "pessoa"}
                        </span>
                      </p>
                    )}
                  </div>

                  {p.sobConsulta ? (
                    <a
                      href={whatsappLink(
                        `Olá! Quero saber mais sobre o pacote ${p.nome} da Pulsar VR.`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-6 block border border-border py-3 text-center font-display text-xs font-bold uppercase tracking-widest transition-all hover:border-neon-cyan hover:text-neon-cyan"
                    >
                      Falar no WhatsApp
                    </a>
                  ) : (
                    <Link
                      to="/reservar"
                      search={{ estacao: p.estacaoRefId }}
                      className="mt-6 block border border-border py-3 text-center font-display text-xs font-bold uppercase tracking-widest transition-all hover:border-neon-cyan hover:text-neon-cyan"
                    >
                      Reservar este pacote
                    </Link>
                  )}
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
