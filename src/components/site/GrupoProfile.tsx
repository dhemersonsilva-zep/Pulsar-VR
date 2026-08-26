import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Clock, Gamepad2, Lock, LockOpen, Trophy, Users } from "lucide-react";
import { BannerUpload } from "@/components/site/BannerUpload";
import { atualizarGrupo, buscarGrupoPorSlug } from "@/lib/grupos.functions";

type Tipo = "squad" | "imperio";

function formatarHoras(minutos: number) {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${resto} min`;
  if (resto === 0) return `${horas}h`;
  return `${horas}h ${resto}min`;
}

export function GrupoProfile({ tipo, slug }: { tipo: Tipo; slug: string }) {
  const buscar = useServerFn(buscarGrupoPorSlug);
  const atualizar = useServerFn(atualizarGrupo);
  const queryClient = useQueryClient();

  const queryKey = ["grupo", tipo, slug];
  const { data: grupo, isLoading } = useQuery({
    queryKey,
    queryFn: () => buscar({ data: { tipo, slug } }),
  });

  const [desbloqueado, setDesbloqueado] = useState(false);
  const [editKey, setEditKey] = useState("");
  const [nomeEdit, setNomeEdit] = useState("");
  const [bannerEdit, setBannerEdit] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  function desbloquear() {
    setErro(null);
    if (editKey.trim().length < 4) return setErro("Informe o código de edição.");
    setDesbloqueado(true);
    setNomeEdit(grupo?.nome ?? "");
  }

  async function salvar() {
    setErro(null);
    setSalvando(true);
    try {
      await atualizar({
        data: {
          tipo,
          slug,
          editKey: editKey.trim(),
          ...(nomeEdit.trim() && nomeEdit.trim() !== grupo?.nome ? { nome: nomeEdit.trim() } : {}),
          ...(bannerEdit ? { bannerBase64: bannerEdit } : {}),
        },
      });
      setSalvo(true);
      setBannerEdit(null);
      await queryClient.invalidateQueries({ queryKey });
      setTimeout(() => setSalvo(false), 2500);
    } catch (e) {
      console.error(e);
      setErro(e instanceof Error ? e.message : "Código de edição inválido.");
    } finally {
      setSalvando(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  if (!grupo) {
    return (
      <div className="glass-panel p-10 text-center">
        <p className="text-muted-foreground">
          Não encontramos {tipo === "squad" ? "essa squad" : "esse império"}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="glass-panel overflow-hidden">
        {grupo.bannerUrl ? (
          <img
            src={grupo.bannerUrl}
            alt={`Banner de ${grupo.nome}`}
            className="aspect-[3/1] w-full object-cover"
          />
        ) : (
          <div className="bg-void aspect-[3/1] w-full" />
        )}

        <div className="space-y-6 p-8">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-neon-cyan">
              {tipo === "squad" ? "Squad" : "Império solo"}
            </span>
            <h1 className="glow-cyan mt-2 font-display text-3xl font-black">{grupo.nome}</h1>
          </div>

          <dl className="grid grid-cols-2 gap-6 border-y border-border py-6 sm:grid-cols-4">
            <div className="flex flex-col items-center gap-1 text-center">
              <Trophy className="size-5 text-neon-orange" />
              <dd className="font-display text-lg font-bold">#{grupo.posicao}</dd>
              <dt className="text-xs text-muted-foreground">na cidade</dt>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Clock className="size-5 text-neon-cyan" />
              <dd className="font-display text-lg font-bold">
                {formatarHoras(grupo.total_minutos_jogados)}
              </dd>
              <dt className="text-xs text-muted-foreground">jogadas</dt>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Gamepad2 className="size-5 text-neon-purple" />
              <dd className="font-display text-lg font-bold">{grupo.jogos_realizados}</dd>
              <dt className="text-xs text-muted-foreground">
                {grupo.jogos_realizados === 1 ? "sessão" : "sessões"}
              </dt>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Users className="size-5 text-neon-pink" />
              <dd className="font-display text-lg font-bold">{grupo.tamanho}</dd>
              <dt className="text-xs text-muted-foreground">
                {grupo.tamanho === 1 ? "jogador" : "jogadores"}
              </dt>
            </div>
          </dl>

          {grupo.total_minutos_jogados === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Ainda sem horas registradas. As horas contam a partir de reservas pagas vinculadas a{" "}
              {tipo === "squad" ? "essa squad" : "esse império"}.
            </p>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        {!desbloqueado ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={editKey}
              onChange={(e) => setEditKey(e.target.value)}
              placeholder="Código de edição (XXXX-XXXX-XXXX)"
              className="flex-1 border border-input bg-card p-3 font-mono text-sm outline-none focus:border-neon-cyan"
            />
            <button
              type="button"
              onClick={desbloquear}
              className="flex items-center justify-center gap-2 border border-border px-6 py-3 font-display text-xs font-bold uppercase tracking-widest transition-all hover:border-neon-cyan"
            >
              <Lock className="size-4" /> Desbloquear edição
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-neon-cyan">
              <LockOpen className="size-4" /> Edição desbloqueada
            </p>
            <input
              type="text"
              value={nomeEdit}
              onChange={(e) => setNomeEdit(e.target.value)}
              maxLength={40}
              className="w-full border border-input bg-card p-3 text-sm outline-none focus:border-neon-cyan"
            />
            <BannerUpload
              value={bannerEdit ?? grupo.bannerUrl}
              onChange={setBannerEdit}
              label="Trocar banner"
            />
            {erro && <p className="text-sm text-destructive">{erro}</p>}
            {salvo && <p className="text-sm text-neon-green">Salvo!</p>}
            <button
              type="button"
              onClick={() => void salvar()}
              disabled={salvando}
              className="w-full bg-neon-cyan py-3 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
            >
              {salvando ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>
        )}
        {!desbloqueado && erro && <p className="mt-2 text-sm text-destructive">{erro}</p>}
      </div>
    </div>
  );
}
