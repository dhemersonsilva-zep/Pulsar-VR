import { useState } from "react";
import { Expand } from "lucide-react";
import heroLounge from "@/assets/hero-lounge.jpg";
import stationVr from "@/assets/station-vr.jpg";
import stationConsole from "@/assets/station-console.jpg";
import stationPc from "@/assets/station-pc.jpg";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { Lightbox, type GalleryImage } from "@/components/site/Lightbox";

const imagens: GalleryImage[] = [
  { src: heroLounge, alt: "Lounge da Pulsar VR" },
  { src: stationVr, alt: "Estação de Realidade Virtual" },
  { src: stationConsole, alt: "Estação PlayStation 5" },
  { src: stationPc, alt: "Estação PC Gamer" },
];

export function GallerySection() {
  const [ativo, setAtivo] = useState<number | null>(null);

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="Conheça a Pulsar" title="POR DENTRO DA ARENA" accent="orange" />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {imagens.map((img, i) => (
            <Reveal key={img.src} delay={i * 80}>
              <button
                type="button"
                onClick={() => setAtivo(i)}
                className="group relative block aspect-square w-full overflow-hidden"
                aria-label={`Ampliar: ${img.alt}`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-background/0 transition-colors group-hover:bg-background/50">
                  <Expand className="size-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <Lightbox
        images={imagens}
        activeIndex={ativo}
        onClose={() => setAtivo(null)}
        onNavigate={setAtivo}
      />
    </section>
  );
}
