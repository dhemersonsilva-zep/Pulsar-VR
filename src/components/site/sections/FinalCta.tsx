import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { Starfield } from "@/components/site/Starfield";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-28">
      <div className="absolute inset-0 bg-void" />
      <Starfield />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <h2 className="glow-cyan font-display text-3xl font-black sm:text-5xl">
            PRONTO PARA <span className="text-gradient-accent">ENTRAR NA ARENA?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Reserve sua estação agora e garanta seu horário na Pulsar VR.
          </p>
          <Link
            to="/reservar"
            className="btn-skew mt-8 inline-block bg-neon-cyan px-10 py-4 font-display text-sm font-bold text-primary-foreground transition-all hover:brightness-110"
          >
            <span className="btn-skew-inner">RESERVAR AGORA</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
