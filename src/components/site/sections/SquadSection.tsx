import { Link } from "@tanstack/react-router";
import { Crown, Users } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { TiltCard } from "@/components/site/TiltCard";

const tamanhos = [2, 3, 4];

export function SquadSection() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="halo-purple absolute right-0 top-1/2 size-[500px] -translate-y-1/2 translate-x-1/3" />
      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <Reveal>
          <span className="mb-4 inline-block font-mono text-xs uppercase tracking-[0.3em] text-neon-purple">
            Comunidade Pulsar
          </span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            MONTE SUA <span className="text-neon-purple">SQUAD</span> OU FUNDE SEU{" "}
            <span className="text-neon-cyan">IMPÉRIO</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Crie um perfil de verdade, com banner e estatísticas, e suba no ranking da cidade.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Reveal delay={100}>
            <TiltCard className="tilt-glow h-full">
              <div className="glass-panel flex h-full flex-col items-center gap-4 p-8 text-center">
                <div className="flex justify-center gap-3">
                  {tamanhos.map((n) => (
                    <div
                      key={n}
                      className="glass-card flex size-14 flex-col items-center justify-center gap-0.5"
                    >
                      <Users className="size-4 text-neon-purple" />
                      <span className="font-display text-sm font-bold">{n}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">SQUAD</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Reúna de 2 a 4 amigos, dê um nome pra squad e transformem cada sessão em pontos
                    no ranking.
                  </p>
                </div>
                <Link
                  to="/squads/novo"
                  className="btn-skew mt-auto inline-block bg-neon-purple px-8 py-3 font-display text-xs font-bold text-primary-foreground transition-all hover:brightness-110"
                >
                  <span className="btn-skew-inner">MONTAR MINHA SQUAD</span>
                </Link>
              </div>
            </TiltCard>
          </Reveal>

          <Reveal delay={200}>
            <TiltCard className="tilt-glow h-full">
              <div className="glass-panel flex h-full flex-col items-center gap-4 p-8 text-center">
                <div className="glass-card flex size-14 items-center justify-center">
                  <Crown className="size-6 text-neon-cyan" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">IMPÉRIO SOLO</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Joga sozinho e no seu ritmo? Funde seu império — quanto mais tempo você joga,
                    maior o seu rank na cidade.
                  </p>
                </div>
                <Link
                  to="/imperios/novo"
                  className="btn-skew mt-auto inline-block bg-neon-cyan px-8 py-3 font-display text-xs font-bold text-primary-foreground transition-all hover:brightness-110"
                >
                  <span className="btn-skew-inner">FUNDAR MEU IMPÉRIO</span>
                </Link>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
