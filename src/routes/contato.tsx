import { createFileRoute } from "@tanstack/react-router";
import { Clock, Instagram, MapPin, MessageCircle } from "lucide-react";
import { PixelDecor, PixelPhone, PixelMolecule } from "@/components/site/PixelDecor";
import { whatsappLink } from "@/lib/pulsar-data";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato e endereço | Pulsar VR Guarapuava" },
      {
        name: "description",
        content:
          "Fale com a Pulsar VR pelo WhatsApp ou venha na loja em Guarapuava. Aberto de segunda a sábado, das 14h às 23h.",
      },
      { property: "og:title", content: "Contato | Pulsar VR" },
      {
        property: "og:description",
        content:
          "WhatsApp, Instagram e endereço da Pulsar VR em Guarapuava/PR.",
      },
    ],
  }),
  component: Contato,
});

const itens = [
  {
    icone: MapPin,
    titulo: "Endereço",
    texto: "Guarapuava, PR",
  },
  {
    icone: Clock,
    titulo: "Horário",
    texto: "Segunda a sábado, 14h às 23h",
  },
  {
    icone: MessageCircle,
    titulo: "WhatsApp",
    texto: "(42) 99941-3305",
  },
  {
    icone: Instagram,
    titulo: "Instagram",
    texto: "@pulsarvr",
  },
];

function Contato() {
  return (
    <main className="relative mx-auto max-w-7xl overflow-hidden px-6 pb-24 pt-32">
      <PixelDecor
        items={[
          { icon: PixelPhone, className: "right-[5%] top-[8%] w-8 h-8 text-neon-cyan", duration: "9s" },
          { icon: PixelMolecule, className: "left-[4%] bottom-[6%] w-9 h-9 text-neon-purple", duration: "11s", delay: "1.5s", drift: true },
        ]}
      />
      <h1 className="font-display text-4xl font-black">
        VEM NOS <span className="text-neon-cyan">VISITAR</span>
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Estamos te esperando. Chame no WhatsApp ou apareça direto na loja.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {itens.map((item) => (
          <div key={item.titulo} className="glass-card flex gap-4 p-6">
            <item.icone className="size-6 shrink-0 text-neon-cyan" />
            <div>
              <h2 className="font-display text-sm font-bold uppercase tracking-widest">
                {item.titulo}
              </h2>
              <p className="mt-1 text-muted-foreground">{item.texto}</p>
            </div>
          </div>
        ))}
      </div>

      <a
        href={whatsappLink("Olá! Queria saber mais sobre a Pulsar VR.")}
        target="_blank"
        rel="noreferrer"
        className="btn-skew mt-12 inline-block bg-neon-cyan px-8 py-4 font-display text-sm font-bold text-primary-foreground transition-all hover:brightness-110"
      >
        <span className="btn-skew-inner">CHAMAR NO WHATSAPP</span>
      </a>
    </main>
  );
}
