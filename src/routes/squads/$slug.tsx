import { createFileRoute } from "@tanstack/react-router";
import { GrupoProfile } from "@/components/site/GrupoProfile";

export const Route = createFileRoute("/squads/$slug")({
  head: () => ({
    meta: [{ title: "Squad | Pulsar VR" }],
  }),
  component: PerfilSquad,
});

function PerfilSquad() {
  const { slug } = Route.useParams();
  return (
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-32">
      <GrupoProfile tipo="squad" slug={slug} />
    </main>
  );
}
