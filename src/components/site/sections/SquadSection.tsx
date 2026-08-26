import { Link } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

const tamanhos = [2, 3, 4];

export function SquadSection() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="halo-purple absolute right-0 top-1/2 size-[500px] -translate-y-1/2 translate-x-1/3" />
      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <Reveal>
          <span className="mb-4 inline-block font-mono text-xs uppercase tracking-[0.3em] text-neon-purple">
            Experiência em grupo
          </span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            CHAME SUA <span className="text-neon-purple">SQUAD</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Reúna seus amigos e transforme uma sessão comum em uma experiência.
          </p>
        </Reveal>

        <Reveal delay={150} className="mt-10 flex justify-center gap-6">
          {tamanhos.map((n) => (
            <div
              key={n}
              className="glass-card flex size-20 flex-col items-center justify-center gap-1 sm:size-24"
            >
              <Users className="size-5 text-neon-purple" />
              <span className="font-display text-lg font-bold">{n}</span>
            </div>
          ))}
        </Reveal>

        <Reveal delay={280} className="mt-10">
          <Link
            to="/reservar"
            className="btn-skew inline-block bg-neon-purple px-10 py-4 font-display text-sm font-bold text-primary-foreground transition-all hover:brightness-110"
          >
            <span className="btn-skew-inner">MONTAR MINHA SQUAD</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
