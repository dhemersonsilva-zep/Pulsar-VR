import { PixelDecor, PixelMolecule } from "@/components/site/PixelDecor";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border py-12">
      <PixelDecor
        items={[
          { icon: PixelMolecule, className: "right-[4%] top-[10%] w-8 h-8 text-neon-cyan", duration: "11s", drift: true },
        ]}
      />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="mb-6 font-display text-2xl font-black">
            <span className="text-neon-cyan">PULSAR</span> VR
          </div>
          <p className="max-w-sm text-muted-foreground">
            Sua gamer house em Guarapuava/PR. Tecnologia de ponta, acessórios
            exclusivos e a melhor comunidade gamer da região.
          </p>
        </div>
        <div>
          <h4 className="mb-6 font-display text-sm font-bold uppercase tracking-widest">
            Onde estamos
          </h4>
          <p className="text-muted-foreground">
            Guarapuava, PR
            <br />
            Seg a Sáb · 14h às 23h
            <br />
            (42) 99941-3305
          </p>
        </div>
        <div>
          <h4 className="mb-6 font-display text-sm font-bold uppercase tracking-widest">
            Pagamento
          </h4>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="border border-border px-2 py-1">PIX</span>
            <span className="border border-border px-2 py-1">CARTÃO</span>
            <span className="border border-border px-2 py-1">MERCADO PAGO</span>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t border-border px-6 pt-8 text-center text-xs uppercase tracking-widest text-muted-foreground/50">
        © {new Date().getFullYear()} Pulsar VR Gamer House
      </div>
    </footer>
  );
}
