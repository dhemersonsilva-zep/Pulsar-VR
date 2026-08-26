import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import { buscarReservaPorId } from "@/lib/reservas.functions";
import { precoBRL, whatsappLink } from "@/lib/pulsar-data";

export const Route = createFileRoute("/pagamento")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { status?: string; external_reference?: string } => {
    const result: { status?: string; external_reference?: string } = {};
    if (typeof search["status"] === "string") result.status = search["status"];
    if (typeof search["external_reference"] === "string")
      result.external_reference = search["external_reference"];
    return result;
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
      "Recebemos seu pagamento. Sua reserva já está confirmada — te chamamos no WhatsApp com os detalhes.",
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
  const { status, external_reference } = Route.useSearch();
  const info = TEXTOS[status ?? "pendente"] ?? TEXTOS["pendente"]!;
  const [copiado, setCopiado] = useState(false);

  const reservaId = external_reference?.startsWith("reserva:")
    ? external_reference.slice("reserva:".length)
    : null;

  const buscar = useServerFn(buscarReservaPorId);
  const { data: reserva } = useQuery({
    queryKey: ["reserva", reservaId],
    queryFn: () => buscar({ data: { id: reservaId! } }),
    enabled: status === "sucesso" && !!reservaId,
  });

  const codigo =
    reserva?.codigo ?? (reservaId ? `PVR-${reservaId.slice(0, 4).toUpperCase()}` : null);

  function copiarCodigo() {
    if (!codigo) return;
    void navigator.clipboard.writeText(codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  const mostrarConfirmacaoRica = status === "sucesso" && reserva;

  return (
    <main className="relative mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center overflow-hidden px-6 pb-24 pt-32">
      {!mostrarConfirmacaoRica && (
        <>
          <h1 className={`font-display text-4xl font-black ${info.cor}`}>{info.titulo}</h1>
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
        </>
      )}

      {mostrarConfirmacaoRica && (
        <div className="glass-panel space-y-8 p-8 text-center">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-neon-cyan">
              Missão confirmada
            </span>
            <h1 className="glow-cyan mt-2 font-display text-3xl font-black">RESERVA CONFIRMADA</h1>
          </div>

          <button
            type="button"
            onClick={copiarCodigo}
            className="mx-auto flex items-center gap-2 border border-neon-cyan/50 px-5 py-2 font-mono text-lg font-bold text-neon-cyan transition-colors hover:bg-neon-cyan/10"
          >
            #{codigo}
            {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>

          <dl className="grid grid-cols-2 gap-4 border-y border-border py-6 text-left text-sm">
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Estação</dt>
              <dd className="mt-1 font-medium">{reserva.estacao_nome}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Jogadores</dt>
              <dd className="mt-1 font-medium">{reserva.pessoas}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Data</dt>
              <dd className="mt-1 font-medium">
                {reserva.data} às {reserva.hora}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Duração</dt>
              <dd className="mt-1 font-medium">{reserva.duracao_horas}h</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Total</dt>
              <dd className="mt-1 font-display text-xl font-bold text-neon-cyan">
                {precoBRL(reserva.total_centavos / 100)}
              </dd>
            </div>
          </dl>

          <p className="text-sm text-muted-foreground">
            Chegue com 10 minutos de antecedência. Leve um documento com foto — o responsável pela
            reserva precisa estar presente no check-in.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/"
              className="flex-1 border border-border py-3 text-center font-display text-sm font-bold uppercase tracking-widest transition-all hover:border-neon-cyan"
            >
              Voltar ao início
            </Link>
            <a
              href={whatsappLink(`Olá! Minha reserva #${codigo} foi confirmada.`)}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 bg-whatsapp py-3 text-center font-display text-sm font-bold uppercase tracking-widest text-background"
            >
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
