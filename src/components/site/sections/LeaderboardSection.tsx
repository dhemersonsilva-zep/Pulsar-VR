import { Lock, Trophy } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";

export function LeaderboardSection() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <SectionHeading
          eyebrow="Em breve"
          title="PULSAR LEADERBOARD"
          subtitle="O ranking oficial da Pulsar vai mostrar quem manda na arena — em VR, PS5 e PC. Ainda estamos construindo essa funcionalidade."
          align="center"
          accent="cyan"
        />

        <Reveal delay={150} className="glass-panel mx-auto max-w-md p-10">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full border border-border">
            <Trophy className="size-7 text-muted-foreground" />
          </div>
          <p className="flex items-center justify-center gap-2 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <Lock className="size-4" /> Ranking em breve
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Assim que o sistema de pontuação entrar no ar, os melhores jogadores da Pulsar aparecem
            aqui.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
