import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Maximize2, TriangleAlert } from "lucide-react";
import { NavePulsar, ZONAS, type ZonaId } from "@/components/site/hub/NavePulsar";
import {
  prefereMenosMovimento,
  resolverPerfil,
  temWebGL,
  type Qualidade,
  type QualidadeEfetiva,
} from "@/lib/webgl";
import type { Cena } from "@/components/site/hub/nave3d/cena";

type Estado =
  | { fase: "verificando" }
  | { fase: "carregando"; progresso: number }
  | { fase: "online"; origem: "glb" | "procedural" }
  | { fase: "sem-webgl" }
  | { fase: "erro"; mensagem: string };

const CORES: Record<string, string> = {
  cyan: "var(--neon-cyan)",
  pink: "var(--neon-pink)",
  purple: "var(--neon-purple)",
  green: "var(--neon-green)",
  orange: "var(--neon-orange)",
};

const OPCOES_QUALIDADE: { valor: Qualidade; rotulo: string }[] = [
  { valor: "auto", rotulo: "Auto" },
  { valor: "baixo", rotulo: "Baixo" },
  { valor: "medio", rotulo: "Médio" },
  { valor: "alto", rotulo: "Alto" },
];

type Props = {
  onSelecionar: (zona: ZonaId) => void;
  destaques?: ZonaId[];
  /** Pausa o loop de render quando um painel está aberto — economiza bateria. */
  pausado?: boolean;
};

export function Nave3D({ onSelecionar, destaques = [], pausado = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cenaRef = useRef<Cena | null>(null);
  const [estado, setEstado] = useState<Estado>({ fase: "verificando" });
  const [qualidade, setQualidade] = useState<Qualidade>("auto");
  const [nivelEfetivo, setNivelEfetivo] = useState<QualidadeEfetiva | null>(null);
  const [ancoras, setAncoras] = useState<
    Record<string, { x: number; y: number; visivel: boolean }>
  >({});
  const [zonaHover, setZonaHover] = useState<ZonaId | null>(null);
  const [revelado, setRevelado] = useState(false);

  /* ---------------------------------------------------------------------
   * Ciclo de vida da cena — só no cliente, nunca no SSR.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    let vivo = true;
    let cena: Cena | null = null;

    if (!temWebGL()) {
      setEstado({ fase: "sem-webgl" });
      return;
    }

    setEstado({ fase: "carregando", progresso: 0 });
    setRevelado(false);

    // import() dinâmico: three só entra no bundle quando o HUB é aberto.
    import("@/components/site/hub/nave3d/cena")
      .then(({ criarCena }) => {
        if (!vivo || !containerRef.current) return;

        const perfil = resolverPerfil(qualidade);
        setNivelEfetivo(perfil.nivel);

        cena = criarCena({
          perfil,
          reduzirMovimento: prefereMenosMovimento(),
          aoProgredir: (pct) => {
            if (!vivo) return;
            setEstado((atual) =>
              atual.fase === "carregando" ? { fase: "carregando", progresso: pct } : atual,
            );
            if (pct >= 100) {
              // Deixa o "NAVE ONLINE" respirar antes de revelar.
              setTimeout(() => {
                if (!vivo || !cena) return;
                setEstado({ fase: "online", origem: cena.origemDoModelo() });
                setTimeout(() => vivo && setRevelado(true), 420);
              }, 500);
            }
          },
          aoFalhar: (erro) => {
            console.error("[Nave3D] erro de carregamento do modelo:", erro);
          },
        });

        cena.montar(containerRef.current);
        cenaRef.current = cena;
      })
      .catch((erro) => {
        console.error("[Nave3D] falha ao inicializar a cena 3D:", erro);
        if (vivo) {
          setEstado({
            fase: "erro",
            mensagem: erro instanceof Error ? erro.message : String(erro),
          });
        }
      });

    return () => {
      vivo = false;
      cena?.destruir();
      cenaRef.current = null;
    };
  }, [qualidade]);

  /* Pausa o render enquanto um painel está aberto */
  useEffect(() => {
    cenaRef.current?.definirPausado(pausado);
  }, [pausado]);

  /* Acompanha as âncoras projetadas para posicionar o HUD */
  useEffect(() => {
    if (estado.fase !== "online" || pausado) return;
    let id = 0;
    const passo = () => {
      const cena = cenaRef.current;
      if (cena) setAncoras(cena.projetarAncoras());
      id = requestAnimationFrame(passo);
    };
    id = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(id);
  }, [estado.fase, pausado]);

  const aoFocarZona = useCallback((id: ZonaId | null) => {
    setZonaHover(id);
    cenaRef.current?.definirZonaAtiva(id);
  }, []);

  /* ---------------------------------------------------------------------
   * Fallbacks reais
   * ------------------------------------------------------------------ */
  if (estado.fase === "sem-webgl" || estado.fase === "erro") {
    return (
      <div className="flex flex-col gap-4">
        <div className="glass-card flex items-start gap-3 p-4">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-neon-orange" />
          <div className="text-xs text-muted-foreground">
            {estado.fase === "sem-webgl" ? (
              <>
                Seu navegador não tem WebGL disponível, então a nave 3D não roda aqui. Estamos
                mostrando a versão vetorial — <strong>todas as áreas continuam funcionando</strong>.
              </>
            ) : (
              <>
                A cena 3D não inicializou ({estado.mensagem}). Caiu para a versão vetorial —{" "}
                <strong>todas as áreas continuam funcionando</strong>. O erro completo está no
                console.
              </>
            )}
          </div>
        </div>
        <NavePulsar onSelecionar={onSelecionar} destaques={destaques} />
      </div>
    );
  }

  const carregando = estado.fase === "verificando" || estado.fase === "carregando";
  const progresso = estado.fase === "carregando" ? estado.progresso : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden border border-neon-cyan/25 bg-[oklch(0.09_0.02_279)] sm:aspect-[16/10]">
        {/* Canvas */}
        <div
          ref={containerRef}
          className={`absolute inset-0 transition-opacity duration-700 ${
            revelado ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />

        {/* Moldura de HUD */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span className="absolute left-3 top-3 size-6 border-l border-t border-neon-cyan/50" />
          <span className="absolute right-3 top-3 size-6 border-r border-t border-neon-cyan/50" />
          <span className="absolute bottom-3 left-3 size-6 border-b border-l border-neon-cyan/50" />
          <span className="absolute bottom-3 right-3 size-6 border-b border-r border-neon-cyan/50" />
        </div>

        {/* Marcadores holográficos — botões HTML de verdade, focáveis */}
        {estado.fase === "online" &&
          revelado &&
          ZONAS.map((zona) => {
            const p = ancoras[zona.id];
            if (!p?.visivel) return null;
            const cor = CORES[zona.accent] ?? "var(--neon-cyan)";
            const ativo = zonaHover === zona.id;
            const destacado = destaques.includes(zona.id);

            return (
              <button
                key={zona.id}
                type="button"
                onClick={() => onSelecionar(zona.id)}
                onMouseEnter={() => aoFocarZona(zona.id)}
                onMouseLeave={() => aoFocarZona(null)}
                onFocus={() => aoFocarZona(zona.id)}
                onBlur={() => aoFocarZona(null)}
                aria-label={`${zona.nome}. ${zona.descricao}.`}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 outline-none"
                style={{ left: `${p.x}px`, top: `${p.y}px` }}
              >
                <span
                  className={`block rounded-full transition-all duration-200 ${
                    ativo ? "size-4" : "size-3"
                  } ${destacado && !ativo ? "animate-pulse-soft" : ""}`}
                  style={{
                    background: cor,
                    boxShadow: `0 0 ${ativo ? 18 : 10}px ${cor}`,
                  }}
                />

                {/* HUD do ponto */}
                <span
                  className={`pointer-events-none absolute left-1/2 top-full mt-3 block w-max max-w-[190px] -translate-x-1/2 border px-3 py-2 text-left backdrop-blur-md transition-all duration-200 ${
                    ativo ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
                  }`}
                  style={{
                    borderColor: cor,
                    background: "color-mix(in oklab, var(--card) 78%, transparent)",
                    boxShadow: `0 0 22px color-mix(in oklab, ${cor} 30%, transparent)`,
                  }}
                >
                  <span
                    className="block font-display text-[10px] font-bold tracking-[0.18em]"
                    style={{ color: cor }}
                  >
                    {zona.nome}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {zona.descricao}
                  </span>
                </span>
              </button>
            );
          })}

        {/* Tela de inicialização */}
        {(carregando || (estado.fase === "online" && !revelado)) && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-[oklch(0.09_0.02_279)] px-6">
            {estado.fase === "online" ? (
              <p className="font-display text-lg font-black tracking-[0.3em] text-neon-green">
                NAVE ONLINE
              </p>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Loader2 className="size-4 animate-spin text-neon-cyan" />
                  <p className="font-display text-sm font-black tracking-[0.3em] text-neon-cyan">
                    INICIALIZANDO NAVE…
                  </p>
                </div>
                <div className="h-1 w-full max-w-xs overflow-hidden bg-secondary">
                  <div
                    className="h-full bg-gradient-accent transition-[width] duration-300 ease-out"
                    style={{ width: `${Math.max(8, progresso)}%` }}
                  />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {progresso}% · sistemas de bordo
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <p className="flex items-center gap-1.5 text-muted-foreground">
          <Maximize2 className="size-3" />
          <span className="hidden sm:inline">Mouse para girar · roda para aproximar</span>
          <span className="sm:hidden">Arraste para girar · pinça para aproximar</span>
        </p>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Qualidade
          </span>
          <div className="flex">
            {OPCOES_QUALIDADE.map((o) => (
              <button
                key={o.valor}
                type="button"
                onClick={() => setQualidade(o.valor)}
                aria-pressed={qualidade === o.valor}
                className={`border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                  qualidade === o.valor
                    ? "border-neon-cyan text-neon-cyan"
                    : "border-border text-muted-foreground hover:border-neon-cyan/40"
                }`}
              >
                {o.rotulo}
              </button>
            ))}
          </div>
        </div>
      </div>

      {estado.fase === "online" && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Render {nivelEfetivo}
          {qualidade === "auto" ? " (auto)" : ""} ·{" "}
          {estado.origem === "glb" ? "modelo GLB carregado" : "nave procedural"}
        </p>
      )}
    </div>
  );
}
