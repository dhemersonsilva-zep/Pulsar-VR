import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { PixelDecor, PixelGamepad, PixelMolecule, PixelMouse } from "@/components/site/PixelDecor";
import { criarPagamentoReserva } from "@/lib/checkout.functions";
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
        content:
          "Escolha a estação, o dia e o horário e garanta seu lugar na Pulsar VR.",
      },
    ],
  }),
  component: Reservar,
});

function Reservar() {
  const { estacao } = Route.useSearch();
  const padrao = stations[0]!;
  const [stationId, setStationId] = useState(estacao ?? padrao.id);
  const [data, setData] = useState("");
  const [hora, setHora] = useState(horarios[4]!);
  const [duracao, setDuracao] = useState(1);
  const [pessoas, setPessoas] = useState(1);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  const station = stations.find((s) => s.id === stationId) ?? padrao;
  const total = station.precoHora * duracao * pessoas;

  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const pagar = useServerFn(criarPagamentoReserva);

  async function pagarReserva() {
    setErro(null);
    if (!data) return setErro("Escolha a data da reserva.");
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
    `Data: ${data || "(a combinar)"} às ${hora}`,
    `Duração: ${duracao}h · Pessoas: ${pessoas}`,
    `Total: ${precoBRL(total)}`,
    nome ? `Nome: ${nome}` : "",
    telefone ? `Telefone: ${telefone}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <main className="relative mx-auto max-w-7xl overflow-hidden px-6 pb-24 pt-32">
      <PixelDecor
        items={[
          { icon: PixelGamepad, className: "right-[3%] top-[10%] w-[60px] h-[32px] text-neon-cyan", duration: "10s", opacity: 0.24 },
          { icon: PixelMolecule, className: "right-[9%] top-[22%] w-11 h-10 text-neon-purple", duration: "13s", delay: "0.3s", opacity: 0.22 },
          { icon: PixelMolecule, className: "right-[32%] top-[16%] w-9 h-8 text-neon-pink", duration: "16s", delay: "1.4s", drift: true, opacity: 0.2 },
          { icon: PixelMouse, className: "right-[46%] top-[13%] w-[30px] h-[38px] text-neon-orange", duration: "12s", delay: "0.6s", drift: true, opacity: 0.24 },
          { icon: PixelMolecule, className: "left-[3%] bottom-[1%] w-[52px] h-[48px] text-neon-cyan", duration: "14s", delay: "2.2s", opacity: 0.22 },
          { icon: PixelMolecule, className: "right-[3%] bottom-[3%] w-11 h-10 text-neon-green", duration: "11s", delay: "0.8s", drift: true, opacity: 0.2 },
          { icon: PixelMouse, className: "right-[16%] bottom-[2%] w-[26px] h-[34px] text-neon-pink", duration: "13s", delay: "1.6s", opacity: 0.24 },
          { icon: PixelGamepad, className: "left-[16%] bottom-[1%] w-[46px] h-[25px] text-neon-purple", duration: "15s", delay: "0.9s", drift: true, opacity: 0.24 },
        ]}
      />
      <h1 className="font-display text-4xl font-black">
        RESERVE SUA <span className="text-neon-cyan">ESTAÇÃO</span>
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Escolha a estação, o dia e o horário. Confirmamos sua reserva no
        WhatsApp em minutos.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          {/* Estação */}
          <div>
            <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
              1. Estação
            </h2>
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
                  <span className="block font-display text-sm font-bold">
                    {s.nome}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {precoBRL(s.precoHora)}/h
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Data e duração */}
          <div>
            <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
              2. Dia, duração e pessoas
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block text-sm">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                  Data
                </span>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full border border-input bg-card p-3 text-sm outline-none focus:border-neon-cyan"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                  Duração
                </span>
                <select
                  value={duracao}
                  onChange={(e) => setDuracao(Number(e.target.value))}
                  className="w-full border border-input bg-card p-3 text-sm outline-none focus:border-neon-cyan"
                >
                  <option value={1}>1 hora</option>
                  <option value={2}>2 horas</option>
                  <option value={3}>3 horas</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                  Pessoas
                </span>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={pessoas}
                  onChange={(e) =>
                    setPessoas(Math.min(8, Math.max(1, Number(e.target.value))))
                  }
                  className="w-full border border-input bg-card p-3 text-sm outline-none focus:border-neon-cyan"
                />
              </label>
            </div>
          </div>

          {/* Horário */}
          <div>
            <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
              3. Horário
            </h2>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-8">
              {horarios.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHora(h)}
                  className={`h-12 border text-xs font-medium transition-all ${
                    h === hora
                      ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                      : "border-border text-muted-foreground hover:bg-card"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Contato */}
          <div>
            <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
              4. Seus dados
            </h2>
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
          </div>
        </div>

        {/* Resumo */}
        <aside className="glass-card h-fit space-y-6 p-8 lg:sticky lg:top-28">
          <h2 className="font-display text-lg font-bold">Resumo da reserva</h2>
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Estação</dt>
              <dd>{station.nome}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Data e hora</dt>
              <dd>{data ? `${data} às ${hora}` : `— às ${hora}`}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Duração</dt>
              <dd>
                {duracao}h · {pessoas} {pessoas > 1 ? "pessoas" : "pessoa"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t border-border pt-4">
              <dt className="font-medium">Total</dt>
              <dd className="font-display text-2xl font-bold text-neon-cyan">
                {precoBRL(total)}
              </dd>
            </div>
          </dl>
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          <button
            type="button"
            onClick={() => void pagarReserva()}
            disabled={carregando}
            className="block w-full bg-neon-cyan py-4 text-center font-display text-sm font-bold uppercase tracking-widest text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
          >
            {carregando ? "Abrindo pagamento..." : "Pagar com Pix ou cartão"}
          </button>
          <a
            href={whatsappLink(mensagem)}
            target="_blank"
            rel="noreferrer"
            className="block border border-border py-4 text-center font-display text-sm font-bold uppercase tracking-widest transition-all hover:border-neon-cyan"
          >
            Prefiro combinar no WhatsApp
          </a>
          <p className="text-center text-xs text-muted-foreground">
            Pagamento seguro pelo Mercado Pago · Pix, cartão e boleto.
          </p>

        </aside>
      </div>
    </main>
  );
}
