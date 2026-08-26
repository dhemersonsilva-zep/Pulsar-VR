import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { GrupoLinkPicker, type GrupoSelecionado } from "@/components/site/GrupoLinkPicker";
import { criarPagamentoReserva } from "@/lib/checkout.functions";
import { getDisponibilidadeDia, type StatusHorario } from "@/lib/disponibilidade.functions";
import { horarios, precoBRL, stations, whatsappLink } from "@/lib/pulsar-data";

export const Route = createFileRoute("/reservar")({
  validateSearch: (search: Record<string, unknown>): { estacao?: string } => {
    const valor = search["estacao"];
    return typeof valor === "string" ? { estacao: valor } : {};
  },

  head: () => ({
    meta: [
      { title: "Reserve sua estação | Pulsar VR" },
      {
        name: "description",
        content:
          "Escolha entre VR, PS5 ou PC Gamer, selecione dia e horário e garanta sua estação na Pulsar VR em Guarapuava.",
      },
      { property: "og:title", content: "Reserve sua estação | Pulsar VR" },
      {
        property: "og:description",
        content: "Escolha a estação, o dia e o horário e garanta seu lugar na Pulsar VR.",
      },
    ],
  }),
  component: Reservar,
});

const ETAPAS = ["Estação", "Jogadores", "Data", "Horário", "Resumo", "Pagamento"] as const;

const STATUS_LABEL: Record<StatusHorario, string> = {
  disponivel: "DISPONÍVEL",
  poucas_vagas: "POUCAS VAGAS",
  lotado: "LOTADO",
};

function dataISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function dataBR(iso: string) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function Reservar() {
  const { estacao } = Route.useSearch();
  const padrao = stations[0]!;

  const [passo, setPasso] = useState(0);
  const [stationId, setStationId] = useState(estacao ?? padrao.id);
  const [pessoas, setPessoas] = useState(1);
  const [duracao, setDuracao] = useState(1);
  const [diaSelecionado, setDiaSelecionado] = useState<Date | undefined>(undefined);
  const [hora, setHora] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [grupo, setGrupo] = useState<GrupoSelecionado | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const station = stations.find((s) => s.id === stationId) ?? padrao;
  const data = diaSelecionado ? dataISO(diaSelecionado) : "";
  const total = station.precoHora * duracao * pessoas;

  const buscarDisponibilidade = useServerFn(getDisponibilidadeDia);
  const { data: disponibilidade, isLoading: carregandoHorarios } = useQuery({
    queryKey: ["disponibilidade", data],
    queryFn: () => buscarDisponibilidade({ data: { data } }),
    enabled: passo === 3 && !!data,
  });

  const pagar = useServerFn(criarPagamentoReserva);

  const podeAvancar = useMemo(() => {
    if (passo === 2) return !!diaSelecionado;
    if (passo === 3) return !!hora;
    if (passo === 4) return nome.trim().length >= 2 && telefone.trim().length >= 8;
    return true;
  }, [passo, diaSelecionado, hora, nome, telefone]);

  async function pagarReserva() {
    setErro(null);
    if (!data || !hora) return setErro("Escolha a data e o horário da reserva.");
    if (nome.trim().length < 2) return setErro("Informe seu nome.");
    if (telefone.trim().length < 8) return setErro("Informe seu telefone.");

    setCarregando(true);
    try {
      const { initPoint } = await pagar({
        data: {
          estacaoId: station.id,
          estacaoNome: station.nome,
          nome: nome.trim(),
          telefone: telefone.trim(),
          data,
          hora,
          duracao,
          pessoas,
          totalCentavos: Math.round(total * 100),
          ...(grupo ? { grupoId: grupo.id } : {}),
        },
      });
      window.location.href = initPoint;
    } catch (e) {
      console.error(e);
      setErro("Não foi possível abrir o pagamento. Tente novamente.");
      setCarregando(false);
    }
  }

  const mensagem = [
    "Olá! Quero reservar na Pulsar VR:",
    `Estação: ${station.nome}`,
    `Data: ${data ? dataBR(data) : "(a combinar)"} às ${hora ?? "(a combinar)"}`,
    `Duração: ${duracao}h · Pessoas: ${pessoas}`,
    `Total: ${precoBRL(total)}`,
    nome ? `Nome: ${nome}` : "",
    telefone ? `Telefone: ${telefone}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  function proximo() {
    if (!podeAvancar) return;
    setErro(null);
    setPasso((p) => Math.min(ETAPAS.length - 1, p + 1));
  }

  function voltar() {
    setErro(null);
    setPasso((p) => Math.max(0, p - 1));
  }

  return (
    <main className="relative mx-auto max-w-3xl overflow-hidden px-6 pb-24 pt-32">
      <h1 className="font-display text-4xl font-black">
        RESERVE SUA <span className="text-neon-cyan">ESTAÇÃO</span>
      </h1>
      <p className="mt-3 text-muted-foreground">
        Escolha a estação, o dia e o horário. Confirmamos sua reserva no WhatsApp em minutos.
      </p>

      {/* Indicador de etapas */}
      <ol className="mt-10 flex items-center gap-1 sm:gap-2">
        {ETAPAS.map((etapa, i) => (
          <li key={etapa} className="flex flex-1 items-center gap-1 sm:gap-2">
            <div
              className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors sm:size-8 ${
                i < passo
                  ? "border-neon-cyan bg-neon-cyan text-primary-foreground"
                  : i === passo
                    ? "border-neon-cyan text-neon-cyan"
                    : "border-border text-muted-foreground"
              }`}
            >
              {i < passo ? <Check className="size-3.5" /> : i + 1}
            </div>
            {i < ETAPAS.length - 1 && (
              <div className={`h-px flex-1 ${i < passo ? "bg-neon-cyan" : "bg-border"}`} />
            )}
          </li>
        ))}
      </ol>
      <p className="mt-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Etapa {passo + 1} de {ETAPAS.length} · {ETAPAS[passo]}
      </p>

      <div className="glass-panel mt-8 min-h-[360px] p-6 sm:p-8">
        {passo === 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {stations.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStationId(s.id)}
                className={`glass-card p-4 text-left transition-all ${
                  s.id === stationId
                    ? "border-neon-cyan shadow-[0_0_20px_color-mix(in_oklab,var(--neon-cyan)_25%,transparent)]"
                    : "hover:border-neon-cyan/40"
                }`}
              >
                <span className="block font-display text-sm font-bold">{s.nome}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {precoBRL(s.precoHora)}/h
                </span>
              </button>
            ))}
          </div>
        )}

        {passo === 1 && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <span className="mb-3 block text-xs uppercase tracking-widest text-muted-foreground">
                Quantas pessoas?
              </span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Diminuir pessoas"
                  onClick={() => setPessoas((p) => Math.max(1, p - 1))}
                  className="flex size-10 items-center justify-center border border-border transition-colors hover:border-neon-cyan"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-10 text-center font-display text-2xl font-bold">{pessoas}</span>
                <button
                  type="button"
                  aria-label="Aumentar pessoas"
                  onClick={() => setPessoas((p) => Math.min(8, p + 1))}
                  className="flex size-10 items-center justify-center border border-border transition-colors hover:border-neon-cyan"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
            <div>
              <span className="mb-3 block text-xs uppercase tracking-widest text-muted-foreground">
                Duração
              </span>
              <div className="flex gap-2">
                {[1, 2, 3].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setDuracao(h)}
                    className={`flex-1 border py-3 text-sm font-medium transition-all ${
                      duracao === h
                        ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                        : "border-border text-muted-foreground hover:border-neon-cyan/40"
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {passo === 2 && (
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={diaSelecionado}
              onSelect={setDiaSelecionado}
              disabled={{ before: new Date() }}
              className="glass-card"
            />
          </div>
        )}

        {passo === 3 && (
          <div>
            {!data && (
              <p className="text-sm text-muted-foreground">Volte e escolha uma data primeiro.</p>
            )}
            {data && carregandoHorarios && (
              <p className="text-sm text-muted-foreground">Carregando horários…</p>
            )}
            {data && !carregandoHorarios && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {horarios.map((h) => {
                  const status = disponibilidade?.[station.id]?.[h] ?? "disponivel";
                  const lotado = status === "lotado";
                  return (
                    <button
                      key={h}
                      type="button"
                      disabled={lotado}
                      onClick={() => setHora(h)}
                      className={`flex flex-col items-center gap-1 border py-3 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                        h === hora
                          ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                          : "border-border text-muted-foreground hover:enabled:border-neon-cyan/40"
                      }`}
                    >
                      <span className="font-display text-sm">{h}</span>
                      <span className="text-[10px]">{STATUS_LABEL[status]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {passo === 4 && (
          <div className="space-y-8">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Estação</dt>
                <dd>{station.nome}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Data e hora</dt>
                <dd>
                  {dataBR(data)} às {hora}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Duração</dt>
                <dd>
                  {duracao}h · {pessoas} {pessoas > 1 ? "pessoas" : "pessoa"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-border pt-3">
                <dt className="font-medium">Total</dt>
                <dd className="font-display text-2xl font-bold text-neon-cyan">
                  {precoBRL(total)}
                </dd>
              </div>
            </dl>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                className="w-full border border-input bg-card p-3 text-sm outline-none focus:border-neon-cyan"
              />
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(42) 9XXXX-XXXX"
                className="w-full border border-input bg-card p-3 text-sm outline-none focus:border-neon-cyan"
              />
            </div>

            <div>
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                Essa reserva conta pra algum squad ou império? (opcional)
              </span>
              <GrupoLinkPicker value={grupo} onChange={setGrupo} />
            </div>
          </div>
        )}

        {passo === 5 && (
          <div className="space-y-6 text-center">
            <p className="text-sm text-muted-foreground">
              Confirme os dados e finalize com Pix, cartão ou boleto pelo Mercado Pago.
            </p>
            <p className="font-display text-3xl font-bold text-neon-cyan">{precoBRL(total)}</p>
            {erro && <p className="text-sm text-destructive">{erro}</p>}
            <button
              type="button"
              onClick={() => void pagarReserva()}
              disabled={carregando}
              className="btn-skew mx-auto block w-full max-w-sm bg-neon-cyan py-4 text-center font-display text-sm font-bold uppercase tracking-widest text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
            >
              <span className="btn-skew-inner">
                {carregando ? "Abrindo pagamento..." : "Pagar com Pix ou cartão"}
              </span>
            </button>
            <a
              href={whatsappLink(mensagem)}
              target="_blank"
              rel="noreferrer"
              className="mx-auto block max-w-sm border border-border py-4 text-center font-display text-sm font-bold uppercase tracking-widest transition-all hover:border-neon-cyan"
            >
              Prefiro combinar no WhatsApp
            </a>
            <p className="text-xs text-muted-foreground">
              Pagamento seguro pelo Mercado Pago · Pix, cartão e boleto.
            </p>
          </div>
        )}
      </div>

      {erro && passo !== 5 && <p className="mt-4 text-sm text-destructive">{erro}</p>}

      {passo < 5 && (
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={voltar}
            disabled={passo === 0}
            className="flex items-center gap-2 border border-border px-6 py-3 font-display text-xs font-bold uppercase tracking-widest transition-all hover:border-neon-cyan disabled:opacity-0"
          >
            <ChevronLeft className="size-4" /> Voltar
          </button>
          <button
            type="button"
            onClick={proximo}
            disabled={!podeAvancar}
            className="flex items-center gap-2 bg-neon-cyan px-8 py-3 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all hover:brightness-110 disabled:opacity-40"
          >
            Continuar <ChevronRight className="size-4" />
          </button>
        </div>
      )}
      {passo === 5 && (
        <button
          type="button"
          onClick={voltar}
          className="mt-8 flex items-center gap-2 border border-border px-6 py-3 font-display text-xs font-bold uppercase tracking-widest transition-all hover:border-neon-cyan"
        >
          <ChevronLeft className="size-4" /> Voltar
        </button>
      )}
    </main>
  );
}
