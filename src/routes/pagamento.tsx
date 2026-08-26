import { createFileRoute, Link } from "@tanstack/react-router";
import { PixelDecor, PixelMolecule } from "@/components/site/PixelDecor";
import { whatsappLink } from "@/lib/pulsar-data";

export const Route = createFileRoute("/pagamento")({
  validateSearch: (search: Record<string, unknown>): { status?: string } => {
    const valor = search["status"];
    return typeof valor === "string" ? { status: valor } : {};
  },
  head: () => ({
    meta: [
      { title: "Status do pagamento | Pulsar VR" },
      {
        name: "description",
        content:
          "Confirmação do seu pagamento Pix ou cartão na Pulsar VR, gamer house em Guarapuava.",
      },
      { property: "og:title", content: "Status do pagamento | Pulsar VR" },
      {
        property: "og:description",
        content: "Acompanhe a confirmação do seu pagamento na Pulsar VR.",
      },
    ],
  }),
  component: Pagamento,
});

const TEXTOS: Record<string, { titulo: string; texto: string; cor: string }> = {
  sucesso: {
    titulo: "PAGAMENTO APROVADO",
    texto:
      "Recebemos seu pagamento. Sua reserva/pedido já está confirmado — te chamamos no WhatsApp com os detalhes.",
    cor: "text-neon-cyan",
  },
  pendente: {
    titulo: "PAGAMENTO PENDENTE",
    texto:
      "Estamos aguardando a confirmação (comum no Pix e no boleto). Assim que cair, confirmamos automaticamente.",
    cor: "text-neon-orange",
  },
  falha: {
    titulo: "PAGAMENTO NÃO CONCLUÍDO",
    texto:
      "O pagamento não foi aprovado. Você pode tentar de novo ou falar com a gente no WhatsApp.",
    cor: "text-destructive",
  },
};

function Pagamento() {
  const { status } = Route.useSearch();
  const info = TEXTOS[status ?? "pendente"] ?? TEXTOS["pendente"]!;

  return (
    <main className="relative mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center overflow-hidden px-6 pb-24 pt-32">
      <PixelDecor
        items={[
          { icon: PixelMolecule, className: "right-[6%] top-[8%] w-9 h-9 text-neon-purple", duration: "10s", drift: true },
        ]}
      />
      <h1 className={`font-display text-4xl font-black ${info.cor}`}>
        {info.titulo}
      </h1>
      <p className="mt-4 text-muted-foreground">{info.texto}</p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          to="/"
          className="bg-neon-cyan px-6 py-3 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground"
        >
          Voltar ao início
        </Link>
        <a
          href={whatsappLink("Olá! Fiz um pagamento no site da Pulsar VR.")}
          target="_blank"
          rel="noreferrer"
          className="border border-border px-6 py-3 font-display text-sm font-bold uppercase tracking-widest"
        >
          Falar no WhatsApp
        </a>
      </div>
    </main>
  );
}
