import { createFileRoute } from "@tanstack/react-router";
import { LocationSection } from "@/components/site/sections/LocationSection";

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
        content: "WhatsApp, Instagram e localização da Pulsar VR em Guarapuava/PR.",
      },
    ],
  }),
  component: Contato,
});

function Contato() {
  return (
    <main className="mx-auto max-w-7xl px-6 pb-24 pt-32">
      <LocationSection asPage />
    </main>
  );
}
