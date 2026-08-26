import { createFileRoute } from "@tanstack/react-router";
import { GrupoProfile } from "@/components/site/GrupoProfile";

export const Route = createFileRoute("/imperios/$slug")({
  head: () => ({
    meta: [{ title: "Império | Pulsar VR" }],
  }),
  component: PerfilImperio,
});

function PerfilImperio() {
  const { slug } = Route.useParams();
  return (
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-32">
      <GrupoProfile tipo="imperio" slug={slug} />
    </main>
  );
}
