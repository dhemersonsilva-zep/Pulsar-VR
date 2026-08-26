import { createFileRoute } from "@tanstack/react-router";
import { GrupoForm } from "@/components/site/GrupoForm";

export const Route = createFileRoute("/imperios/novo")({
  head: () => ({
    meta: [
      { title: "Fundar Império | Pulsar VR" },
      {
        name: "description",
        content:
          "Funde seu império solo na Pulsar VR: quanto mais você joga, maior o rank do seu império na cidade.",
      },
    ],
  }),
  component: NovoImperio,
});

function NovoImperio() {
  return (
    <main className="mx-auto max-w-xl px-6 pb-24 pt-32">
      <h1 className="font-display text-4xl font-black">
        FUNDE SEU <span className="text-neon-purple">IMPÉRIO</span>
      </h1>
      <p className="mt-3 text-muted-foreground">
        Pra quem joga sozinho e no seu ritmo. Quanto mais tempo você joga, maior o rank do seu
        império na cidade.
      </p>
      <div className="mt-10">
        <GrupoForm tipo="imperio" />
      </div>
    </main>
  );
}
