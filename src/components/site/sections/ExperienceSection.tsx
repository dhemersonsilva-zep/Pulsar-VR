import { useState } from "react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { StationCard } from "@/components/site/StationCard";
import { Reveal } from "@/components/site/Reveal";
import { ExperienceModal } from "@/components/site/ExperienceModal";
import { stations, type Station } from "@/lib/pulsar-data";

export function ExperienceSection() {
  const [selecionada, setSelecionada] = useState<Station | null>(null);

  return (
    <section id="experiencias" className="relative scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Escolha sua experiência"
          title="QUAL SERÁ SUA PRÓXIMA MISSÃO?"
          accent="purple"
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {stations.map((s, i) => (
            <Reveal key={s.id} delay={i * 100}>
              <StationCard station={s} onSelect={setSelecionada} />
            </Reveal>
          ))}
        </div>
      </div>

      <ExperienceModal station={selecionada} onClose={() => setSelecionada(null)} />
    </section>
  );
}
