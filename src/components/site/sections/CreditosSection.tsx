import { CalendarClock, Coins, Gift, Sparkles, Trophy, Users } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { TiltCard } from "@/components/site/TiltCard";
import {
  CREDITOS_GRUPO_MINIMO,
  CREDITOS_MULTIPLICADOR_GRUPO,
  CREDITOS_VALIDADE_DIAS,
  melhorRetornoPercent,
  precoBRL,
  recompensas,
  retornoRecompensaPercent,
  valorRecompensa,
  whatsappLink,
} from "@/lib/pulsar-data";

const accentText = {
  cyan: "text-neon-cyan",
  pink: "text-neon-pink",
  purple: "text-neon-purple",
  green: "text-neon-green",
  orange: "text-neon-orange",
} as const;

const accentBg = {
  cyan: "bg-neon-cyan",
  pink: "bg-neon-pink",
  purple: "bg-neon-purple",
  green: "bg-neon-green",
  orange: "bg-neon-orange",
} as const;

const accentBorder = {
  cyan: "border-neon-cyan/50",
  pink: "border-neon-pink/50",
  purple: "border-neon-purple/50",
  green: "border-neon-green/50",
  orange: "border-neon-orange/50",
} as const;

const comoFunciona = [
  {
    icone: Coins,
    titulo: "Gastou, ganhou",
    texto: "Cada R$ 1 em reservas, pacotes ou loja vira 1 crédito na sua conta.",
  },
  {
    icone: CalendarClock,
    titulo: "Acumule",
    texto: `Os créditos ficam guardados por ${CREDITOS_VALIDADE_DIAS} dias. Junte pra trocar por algo maior.`,
  },
  {
    icone: Gift,
    titulo: "Troque",
    texto: "Vire desconto na próxima reserva ou tempo de jogo grátis. Você escolhe.",
  },
];

const bonus = [
  {
    icone: Users,
    titulo: `Grupo rende ${CREDITOS_MULTIPLICADOR_GRUPO.toLocaleString("pt-BR")}x`,
    texto: `Reservou para ${CREDITOS_GRUPO_MINIMO} pessoas ou mais? Os créditos daquela sessão contam em dobro e meio.`,
  },
  {
    icone: Trophy,
    titulo: "Torneios e eventos",
    texto: "Créditos também abatem inscrição em torneio e ingresso de evento da casa.",
  },
  {
    icone: Sparkles,
    titulo: "Acesso antecipado",
    texto: "Quem tem créditos ativos entra antes nas reservas de jogos e eventos novos.",
  },
];

export function CreditosSection() {
  return (
    <section id="creditos" className="relative scroll-mt-24 overflow-hidden py-24">
      <div className="halo-cyan absolute left-0 top-32 size-[520px] -translate-x-1/2" />

      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Pulsar Créditos"
          title="CADA REAL VIRA CRÉDITO"
          subtitle="Sem mensalidade e sem fidelidade. Você joga, os créditos entram, e você troca por desconto ou por tempo de jogo grátis."
          accent="cyan"
        />

        {/* Bloco-âncora: a promessa do programa e a prova em números. */}
        <Reveal>
          <div className="relative mb-14 overflow-hidden border border-neon-cyan/30 bg-card/40">
            <div className="bg-grid absolute inset-0 opacity-50" />
            <div className="halo-purple absolute right-0 top-1/2 size-[420px] -translate-y-1/2 translate-x-1/3" />

            <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-neon-cyan">
                  O jeito Pulsar
                </span>
                <h3 className="mt-4 font-display text-4xl font-black leading-[0.95] sm:text-6xl">
                  JOGUE MAIS,
                  <br />
                  <span className="text-gradient-accent">PAGUE MENOS</span>
                </h3>
                <p className="mt-5 max-w-md text-muted-foreground">
                  Quanto mais créditos você junta antes de trocar, mais cada crédito rende. A maior
                  troca do catálogo devolve {melhorRetornoPercent()}% do que você gastou — em jogo.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-[420px]">
                {[
                  { valor: "R$ 1", legenda: "vira 1 crédito", cor: "text-neon-cyan" },
                  {
                    valor: `${melhorRetornoPercent()}%`,
                    legenda: "de volta em jogo",
                    cor: "text-neon-green",
                  },
                  {
                    valor: `${CREDITOS_VALIDADE_DIAS}`,
                    legenda: "dias de validade",
                    cor: "text-neon-purple",
                  },
                ].map((t) => (
                  <div key={t.legenda} className="glass-card flex flex-col gap-1 p-5 text-center">
                    <span className={`font-display text-3xl font-bold ${t.cor}`}>{t.valor}</span>
                    <span className="text-[11px] text-muted-foreground">{t.legenda}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Como funciona, em três passos */}
        <div className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {comoFunciona.map((passo, i) => (
            <Reveal key={passo.titulo} delay={i * 100}>
              <div className="glass-card flex h-full flex-col gap-3 p-6">
                <div className="flex items-center gap-3">
                  <passo.icone className="size-5 text-neon-cyan" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Passo {i + 1}
                  </span>
                </div>
                <h3 className="font-display text-base font-bold">{passo.titulo}</h3>
                <p className="text-sm text-muted-foreground">{passo.texto}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Catálogo de trocas */}
        <Reveal>
          <h3 className="mb-2 text-center font-display text-2xl font-bold uppercase tracking-wide">
            Troque seus créditos
          </h3>
          <p className="mb-8 text-center text-sm text-muted-foreground">
            Junte o quanto quiser e resgate quando der vontade.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recompensas.map((r, i) => {
            const valor = valorRecompensa(r);
            const retorno = retornoRecompensaPercent(r);

            return (
              <Reveal key={r.id} delay={i * 80}>
                <TiltCard className="tilt-glow h-full">
                  <div
                    className={`glass-panel flex h-full flex-col p-6 ${
                      r.destaque ? accentBorder[r.accent] : ""
                    }`}
                  >
                    {r.destaque && (
                      <span
                        className={`mb-4 inline-block w-fit px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-primary-foreground ${accentBg[r.accent]}`}
                      >
                        Melhor troca
                      </span>
                    )}

                    <div className="flex items-baseline gap-2">
                      <span className={`font-display text-4xl font-black ${accentText[r.accent]}`}>
                        {r.creditos}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                        créditos
                      </span>
                    </div>

                    <h4 className="mt-4 font-display text-lg font-bold">{r.titulo}</h4>
                    <p className="mt-2 flex-1 text-sm text-muted-foreground">{r.detalhe}</p>

                    <div className="mt-6 border-t border-border pt-4">
                      {valor > 0 ? (
                        <p className="text-xs text-muted-foreground">
                          Vale <span className="font-bold text-foreground">{precoBRL(valor)}</span>{" "}
                          em jogo ·{" "}
                          <span className="font-bold text-neon-green">{retorno}% de volta</span>
                        </p>
                      ) : r.descontoPercent ? (
                        <p className="text-xs text-muted-foreground">
                          Vale{" "}
                          <span className="font-bold text-foreground">
                            {r.descontoPercent}% off
                          </span>{" "}
                          em qualquer reserva
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          O benefício muda a cada mês — a gente avisa quem chegar lá
                        </p>
                      )}
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>

        {/* Bônus do programa */}
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {bonus.map((b, i) => (
            <Reveal key={b.titulo} delay={i * 100}>
              <div className="glass-card flex h-full flex-col gap-3 p-6">
                <b.icone className="size-5 text-neon-purple" />
                <h3 className="font-display text-base font-bold">{b.titulo}</h3>
                <p className="text-sm text-muted-foreground">{b.texto}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Regras */}
        <Reveal delay={150} className="mt-10">
          <div className="glass-card p-6 sm:p-8">
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              Créditos são individuais e não transferíveis. Cada crédito vale por{" "}
              {CREDITOS_VALIDADE_DIAS} dias a partir do dia em que entrou — os mais antigos são
              usados primeiro. Trocar créditos consome o saldo. Tempo de jogo resgatado vale para
              uma sessão, sujeito a disponibilidade da estação no horário escolhido. O programa
              ainda é controlado manualmente pela equipe — o saldo automático no site vem junto com
              a sua conta Pulsar.
            </p>

            <div className="mt-6 flex justify-center">
              <a
                href={whatsappLink(
                  "Olá! Quero saber quantos créditos Pulsar eu tenho e o que dá pra trocar.",
                )}
                target="_blank"
                rel="noreferrer"
                className="btn-skew inline-block bg-neon-cyan px-8 py-3 font-display text-xs font-bold text-primary-foreground transition-all hover:brightness-110"
              >
                <span className="btn-skew-inner">CONSULTAR MEUS CRÉDITOS</span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
