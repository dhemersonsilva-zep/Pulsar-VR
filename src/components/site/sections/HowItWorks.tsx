import { CalendarDays, Gamepad2, QrCode, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";

const passos = [
  {
    numero: "01",
    icone: Gamepad2,
    titulo: "Escolha sua experiência",
    texto: "VR, PS5 ou PC Gamer.",
  },
  {
    numero: "02",
    icone: CalendarDays,
    titulo: "Escolha o horário",
    texto: "Veja os horários disponíveis em tempo real.",
  },
  {
    numero: "03",
    icone: QrCode,
    titulo: "Faça o pagamento",
    texto: "Pagamento seguro via Pix ou cartão.",
  },
  {
    numero: "04",
    icone: Sparkles,
    titulo: "Venha jogar",
    texto: "Chegue no horário e aproveite a arena.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="O processo" title="COMO FUNCIONA" align="center" />

        <div className="relative grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute inset-x-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block" />
          {passos.map((p, i) => (
            <Reveal key={p.numero} delay={i * 120} className="relative text-center">
              <div className="glass-card relative z-10 mx-auto mb-5 flex size-16 items-center justify-center rounded-full border-neon-cyan/40">
                <p.icone className="size-6 text-neon-cyan" />
              </div>
              <span className="font-mono text-xs text-muted-foreground">{p.numero}</span>
              <h3 className="mt-1 font-display text-lg font-bold">{p.titulo}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.texto}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
