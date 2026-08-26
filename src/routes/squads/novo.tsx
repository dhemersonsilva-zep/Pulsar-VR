import { createFileRoute } from "@tanstack/react-router";
import { GrupoForm } from "@/components/site/GrupoForm";

export const Route = createFileRoute("/squads/novo")({
  head: () => ({
    meta: [
      { title: "Criar Squad | Pulsar VR" },
      {
        name: "description",
        content:
          "Monte sua squad na Pulsar VR: escolha o nome, o tamanho e comece a subir no ranking da cidade.",
      },
    ],
  }),
  component: NovaSquad,
});

function NovaSquad() {
  return (
    <main className="mx-auto max-w-xl px-6 pb-24 pt-32">
      <h1 className="font-display text-4xl font-black">
        MONTE SUA <span className="text-neon-cyan">SQUAD</span>
      </h1>
      <p className="mt-3 text-muted-foreground">
        Escolha um nome, o tamanho e comece a somar horas jogadas pra subir no ranking da cidade.
      </p>
      <div className="mt-10">
        <GrupoForm tipo="squad" />
      </div>
    </main>
  );
}
