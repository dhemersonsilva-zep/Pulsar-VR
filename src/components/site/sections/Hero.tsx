import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import heroLounge from "@/assets/hero-lounge.jpg";
import { Starfield } from "@/components/site/Starfield";

const STEPS = ["eyebrow", "title", "subtitle", "actions"] as const;

export function Hero() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setStep(STEPS.length);
      return;
    }
    const timers = STEPS.map((_, i) => window.setTimeout(() => setStep(i + 1), 220 + i * 260));
    return () => timers.forEach(clearTimeout);
  }, []);

  const visible = (i: number) => step > i;

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 z-0">
        <img
          src={heroLounge}
          alt="Interior da Pulsar VR com estações de VR e PCs gamer sob luz neon"
          width={1920}
          height={1088}
          className="size-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-void opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/80" />
        <Starfield />
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="halo-cyan absolute left-1/2 top-1/2 size-[700px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 px-6 text-center">
        <span
          className={`mb-6 inline-block font-mono text-xs uppercase tracking-[0.4em] text-neon-cyan transition-all duration-700 ${
            visible(0) ? "opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          Pulsar VR · Arena gamer
        </span>

        <h1
          className={`glow-cyan font-display text-5xl font-black leading-[1.05] tracking-tight transition-all duration-700 md:text-7xl ${
            visible(1) ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          SUA PRÓXIMA <span className="text-gradient-accent">EXPERIÊNCIA</span>
          <br />
          COMEÇA AQUI
        </h1>

        <p
          className={`mx-auto mt-6 max-w-2xl text-lg font-light text-muted-foreground transition-all duration-700 md:text-xl ${
            visible(2) ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          Experiências imersivas de Realidade Virtual, PS5 e PC Gamer em um único lugar. Reserve sua
          estação e entre na arena.
        </p>

        <div
          className={`mt-10 flex flex-wrap items-center justify-center gap-4 transition-all duration-700 ${
            visible(3) ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <Link
            to="/reservar"
            className="btn-skew bg-neon-cyan px-10 py-4 font-display text-sm font-bold text-primary-foreground transition-all hover:brightness-110"
          >
            <span className="btn-skew-inner">RESERVAR AGORA</span>
          </Link>
          <Link
            to="/"
            hash="experiencias"
            className="btn-skew border border-border px-10 py-4 font-display text-sm font-bold text-foreground transition-all hover:border-neon-cyan hover:text-neon-cyan"
          >
            <span className="btn-skew-inner">CONHECER EXPERIÊNCIAS</span>
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-muted-foreground/60">
        <div className="h-10 w-px animate-pulse-soft bg-gradient-to-b from-neon-cyan to-transparent" />
      </div>
    </section>
  );
}
