import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/sections/Hero";
import { ExperienceSection } from "@/components/site/sections/ExperienceSection";
import { HowItWorks } from "@/components/site/sections/HowItWorks";
import { PackagesSection } from "@/components/site/sections/PackagesSection";
import { SquadSection } from "@/components/site/sections/SquadSection";
import { TodaySection } from "@/components/site/sections/TodaySection";
import { GallerySection } from "@/components/site/sections/GallerySection";
import { LeaderboardSection } from "@/components/site/sections/LeaderboardSection";
import { PointsSection } from "@/components/site/sections/PointsSection";
import { TestimonialsSection } from "@/components/site/sections/TestimonialsSection";
import { LocationSection } from "@/components/site/sections/LocationSection";
import { FinalCta } from "@/components/site/sections/FinalCta";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulsar VR — Experiências Gamer Imersivas" },
      {
        name: "description",
        content:
          "Arena gamer em Guarapuava/PR: reserve estações de Realidade Virtual, PS5 e PC Gamer por hora, pague via Pix e viva uma experiência imersiva de verdade.",
      },
      {
        property: "og:title",
        content: "Pulsar VR — Experiências Gamer Imersivas",
      },
      {
        property: "og:description",
        content:
          "Reserve VR, PS5 e PC Gamer por hora em Guarapuava/PR. Pagamento via Pix. Sua próxima experiência começa aqui.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <Hero />
      <ExperienceSection />
      <HowItWorks />
      <PackagesSection />
      <SquadSection />
      <TodaySection />
      <GallerySection />
      <LeaderboardSection />
      <PointsSection />
      <TestimonialsSection />
      <LocationSection />
      <FinalCta />
    </main>
  );
}
