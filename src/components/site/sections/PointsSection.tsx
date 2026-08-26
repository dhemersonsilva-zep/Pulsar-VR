import { Gift, Share2, Swords, Zap } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";

const formas = [
  { icone: Zap, texto: "Jogar" },
  { icone: Gift, texto: "Reservar" },
  { icone: Share2, texto: "Indicar amigos" },
  { icone: Swords, texto: "Participar de desafios" },
];

export function PointsSection() {
  return (
    <section className="relative overflow-hidden bg-card/30 py-24">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <SectionHeading
          eyebrow="Em breve"
          title="PULSAR POINTS"
          subtitle="Um programa de fidelidade para quem vive a Pulsar. Em breve você vai poder ganhar pontos:"
          align="center"
          accent="purple"
        />

        <Reveal delay={150} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {formas.map((f) => (
            <div key={f.texto} className="glass-card flex flex-col items-center gap-3 p-6">
              <f.icone className="size-6 text-neon-purple" />
              <span className="text-sm font-medium">{f.texto}</span>
            </div>
          ))}
        </Reveal>

        <p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground">
          Funcionalidade futura — nenhum cadastro necessário hoje
        </p>
      </div>
    </section>
  );
}
