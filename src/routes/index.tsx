import { createFileRoute, Link } from "@tanstack/react-router";
import heroLounge from "@/assets/hero-lounge.jpg";
import { StationCard } from "@/components/site/StationCard";
import { ProductCard } from "@/components/site/ProductCard";
import { jogos, produtos, stations } from "@/lib/pulsar-data";
import {
  PixelDecor,
  PixelGamepad,
  PixelMolecule,
  PixelMouse,
  PixelPhone,
} from "@/components/site/PixelDecor";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulsar VR | Gamer House em Guarapuava — VR, PS5 e PC Gamer" },
      {
        name: "description",
        content:
          "Reserve estações de Realidade Virtual, PS5 e PC Gamer por hora em Guarapuava. Acessórios gamers e pagamento via Pix.",
      },
      {
        property: "og:title",
        content: "Pulsar VR | Gamer House em Guarapuava",
      },
      {
        property: "og:description",
        content:
          "Reserve estações de VR, PS5 e PC Gamer por hora. Acessórios gamers e pagamento via Pix.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img
            src={heroLounge}
            alt="Interior da Pulsar VR com estações de VR e PCs gamer sob luz neon"
            width={1920}
            height={1088}
            className="size-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/70" />
          <div className="halo-cyan absolute left-1/2 top-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2" />

        </div>

        <PixelDecor
          layer="front"
          items={[
            { icon: PixelGamepad, className: "left-[7%] top-[22%] w-[62px] h-[33px] text-neon-cyan", duration: "9s", opacity: 0.26 },
            { icon: PixelMolecule, className: "right-[10%] top-[18%] w-9 h-9 text-neon-purple", duration: "11s", delay: "1s", drift: true },
            { icon: PixelMouse, className: "left-[13%] bottom-[14%] w-[38px] h-[49px] text-neon-pink", duration: "10s", delay: "2s", drift: true, opacity: 0.26 },
            { icon: PixelPhone, className: "right-[14%] bottom-[22%] w-7 h-7 text-neon-green", duration: "8s", delay: "0.5s" },
          ]}
        />

        <div className="relative z-10 px-6 text-center">
          <h1 className="glow-cyan mb-4 font-display text-4xl font-black tracking-tight md:text-7xl">
            DOMINE A <span className="text-gradient-accent">REALIDADE</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg font-light text-muted-foreground md:text-xl">
            A experiência definitiva em Guarapuava. VR, PS5 e PCs de alta
            performance em um ambiente imersivo.
          </p>
          <div className="bg-gradient-accent inline-block p-px">
            <Link
              to="/reservar"
              className="block bg-background px-10 py-4 font-display font-bold transition-colors hover:bg-transparent"
            >
              EXPLORAR ARENA
            </Link>
          </div>
        </div>
      </section>

      {/* Estações */}
      <section className="relative mx-auto max-w-7xl overflow-hidden px-6 py-24">
        <PixelDecor
          items={[
            { icon: PixelMouse, className: "left-[2%] top-[6%] w-[34px] h-[44px] text-neon-cyan", duration: "10s", opacity: 0.24 },
            { icon: PixelMolecule, className: "right-[3%] bottom-[8%] w-10 h-10 text-neon-purple", duration: "12s", delay: "1.5s", drift: true },
          ]}
        />
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold text-neon-purple">
              ESTAÇÕES DE JOGO
            </h2>
            <p className="mt-2 text-muted-foreground">
              Escolha seu campo de batalha e reserve por hora
            </p>
          </div>
          <span className="hidden font-mono text-sm text-neon-cyan md:block">
            // LEVEL_UP_YOUR_GAME
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {stations.map((s) => (
            <StationCard key={s.id} station={s} />
          ))}
        </div>
      </section>

      {/* Loja */}
      <section className="relative overflow-hidden bg-card/40 py-24">
        <PixelDecor
          items={[
            { icon: PixelPhone, className: "left-[5%] top-[10%] w-7 h-7 text-neon-orange", duration: "9s" },
            { icon: PixelGamepad, className: "right-[6%] bottom-[10%] w-[58px] h-[31px] text-neon-cyan", duration: "11s", delay: "2s", drift: true, opacity: 0.24 },
          ]}
        />
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <h2 className="font-display text-3xl font-bold">
              LOJA <span className="text-neon-orange">GEAR</span>
            </h2>
            <Link
              to="/loja"
              className="text-muted-foreground underline underline-offset-8 transition-colors hover:text-foreground"
            >
              VER TODOS OS PRODUTOS
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {produtos.map((p) => (
              <ProductCard key={p.id} produto={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Jogos */}
      <section className="relative overflow-hidden py-24">
        <PixelDecor
          items={[
            { icon: PixelMolecule, className: "left-[4%] bottom-[4%] w-8 h-8 text-neon-pink", duration: "10s", drift: true },
          ]}
        />
        <div className="mb-10 px-6 text-center">
          <h2 className="font-display text-2xl font-bold">OS MELHORES TÍTULOS</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto px-6 pb-4">
          {jogos.map((jogo) => (
            <div
              key={jogo}
              className="glass-card grid h-72 w-52 flex-none place-items-center p-4 transition-colors hover:border-neon-cyan/40"
            >
              <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                {jogo}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
