import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Loader2, ShieldCheck } from "lucide-react";
import { AVATARES, EMBLEMAS } from "@/lib/progressao";
import { entrarNoHub, fundarImperio, verificarTelefone } from "@/lib/hub.functions";

type Passo = "telefone" | "codigo" | "fundar" | "codigo-gerado";

function mensagemDeErro(e: unknown): string {
  if (e instanceof Error && e.message && !e.message.startsWith("[")) return e.message;
  return "Algo deu errado. Tente de novo.";
}

/**
 * Porta de entrada do HUB. Identidade é o telefone que a reserva já captura —
 * nenhum login novo. O código de acesso é mostrado UMA vez, mesmo contrato da
 * chave de edição dos squads.
 */
export function AcessoHub({ onEntrou }: { onEntrou: () => void }) {
  const [passo, setPasso] = useState<Passo>("telefone");
  const [telefone, setTelefone] = useState("");
  const [codigo, setCodigo] = useState("");
  const [comandante, setComandante] = useState("");
  const [imperioNome, setImperioNome] = useState("");
  const [squadNome, setSquadNome] = useState("");
  const [avatarId, setAvatarId] = useState<string>(AVATARES[0].id);
  const [emblemaId, setEmblemaId] = useState<string>(EMBLEMAS[0].id);
  const [reservasEncontradas, setReservasEncontradas] = useState(0);
  const [codigoGerado, setCodigoGerado] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const verificar = useServerFn(verificarTelefone);
  const entrar = useServerFn(entrarNoHub);
  const fundar = useServerFn(fundarImperio);

  async function checarTelefone() {
    setErro(null);
    if (telefone.replace(/\D/g, "").length < 10) return setErro("Informe um telefone válido.");

    setCarregando(true);
    try {
      const r = await verificar({ data: { telefone } });
      setReservasEncontradas(r.reservasEncontradas);
      setPasso(r.existe ? "codigo" : "fundar");
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }

  async function entrarComCodigo() {
    setErro(null);
    setCarregando(true);
    try {
      await entrar({ data: { telefone, codigo } });
      onEntrou();
    } catch (e) {
      setErro(mensagemDeErro(e));
      setCarregando(false);
    }
  }

  async function criarImperio() {
    setErro(null);
    setCarregando(true);
    try {
      const r = await fundar({
        data: {
          telefone,
          comandante: comandante.trim(),
          imperioNome: imperioNome.trim(),
          squadNome: squadNome.trim(),
          avatarId,
          emblemaId,
        },
      });
      setCodigoGerado(r.codigo);
      setPasso("codigo-gerado");
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }

  const inputClass =
    "w-full border border-input bg-background/60 px-4 py-3 text-sm outline-none transition-colors focus:border-neon-cyan";

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="glass-panel flex flex-col gap-6 p-6 sm:p-8">
        {passo === "telefone" && (
          <>
            <header>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan">
                Acesso ao HUB
              </p>
              <h2 className="mt-2 font-display text-2xl font-black">IDENTIFIQUE-SE, COMANDANTE</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Use o mesmo telefone das suas reservas. É por ele que a nave encontra o seu
                histórico — não precisa criar conta nem senha.
              </p>
            </header>

            <label className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Telefone
              </span>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checarTelefone()}
                placeholder="(42) 99999-0000"
                className={inputClass}
              />
            </label>

            <button
              type="button"
              disabled={carregando}
              onClick={checarTelefone}
              className="btn-skew bg-neon-cyan px-8 py-3 font-display text-xs font-bold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60"
            >
              <span className="btn-skew-inner inline-flex items-center gap-2">
                {carregando && <Loader2 className="size-3.5 animate-spin" />}
                CONTINUAR
              </span>
            </button>
          </>
        )}

        {passo === "codigo" && (
          <>
            <header>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan">
                Império encontrado
              </p>
              <h2 className="mt-2 font-display text-2xl font-black">CÓDIGO DE ACESSO</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Digite o código que você recebeu quando fundou seu império.
              </p>
            </header>

            <label className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Código
              </span>
              <input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && entrarComCodigo()}
                placeholder="XXXX-XXXX-XXXX"
                className={`${inputClass} font-mono tracking-widest`}
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={carregando}
                onClick={entrarComCodigo}
                className="btn-skew bg-neon-cyan px-8 py-3 font-display text-xs font-bold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60"
              >
                <span className="btn-skew-inner inline-flex items-center gap-2">
                  {carregando && <Loader2 className="size-3.5 animate-spin" />}
                  ENTRAR NA NAVE
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPasso("telefone");
                  setErro(null);
                }}
                className="border border-border px-6 py-3 font-display text-xs font-bold uppercase tracking-widest transition-colors hover:border-neon-cyan"
              >
                Voltar
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Perdeu o código? Fale com a equipe no WhatsApp — só quem tem acesso ao banco consegue
              gerar um novo.
            </p>
          </>
        )}

        {passo === "fundar" && (
          <>
            <header>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-purple">
                Primeira vez por aqui
              </p>
              <h2 className="mt-2 font-display text-3xl font-black">FUNDE SEU IMPÉRIO</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {reservasEncontradas > 0 ? (
                  <>
                    Encontramos{" "}
                    <span className="font-bold text-neon-cyan">
                      {reservasEncontradas} {reservasEncontradas === 1 ? "reserva" : "reservas"}
                    </span>{" "}
                    nesse telefone. Elas entram no seu império assim que ele existir.
                  </>
                ) : (
                  "Ainda não há reservas nesse telefone. Seu império nasce zerado e cresce a cada sessão."
                )}
              </p>
            </header>

            <label className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Seu nome (comandante)
              </span>
              <input
                value={comandante}
                onChange={(e) => setComandante(e.target.value)}
                maxLength={40}
                placeholder="Dhemerson"
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Nome do império · 3 a 28 caracteres
              </span>
              <input
                value={imperioNome}
                onChange={(e) => setImperioNome(e.target.value)}
                maxLength={28}
                placeholder="Nova Era"
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Nome do squad · opcional
              </span>
              <input
                value={squadNome}
                onChange={(e) => setSquadNome(e.target.value)}
                maxLength={28}
                placeholder="Esquadrão Órion"
                className={inputClass}
              />
            </label>

            <fieldset className="flex flex-col gap-2">
              <legend className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Avatar
              </legend>
              <div className="flex flex-wrap gap-2">
                {AVATARES.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAvatarId(a.id)}
                    aria-pressed={avatarId === a.id}
                    title={a.nome}
                    className={`flex size-12 items-center justify-center border text-xl transition-all ${
                      avatarId === a.id
                        ? "border-neon-cyan bg-neon-cyan/15 text-neon-cyan"
                        : "border-border text-muted-foreground hover:border-neon-cyan/50"
                    }`}
                  >
                    {a.glifo}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-2">
              <legend className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Emblema
              </legend>
              <div className="flex flex-wrap gap-2">
                {EMBLEMAS.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setEmblemaId(e.id)}
                    aria-pressed={emblemaId === e.id}
                    title={e.nome}
                    className={`flex size-12 items-center justify-center border text-xl transition-all ${
                      emblemaId === e.id
                        ? "border-neon-purple bg-neon-purple/15 text-neon-purple"
                        : "border-border text-muted-foreground hover:border-neon-purple/50"
                    }`}
                  >
                    {e.glifo}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={carregando}
                onClick={criarImperio}
                className="btn-skew bg-neon-purple px-8 py-3 font-display text-xs font-bold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60"
              >
                <span className="btn-skew-inner inline-flex items-center gap-2">
                  {carregando && <Loader2 className="size-3.5 animate-spin" />}
                  FUNDAR IMPÉRIO
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPasso("telefone");
                  setErro(null);
                }}
                className="border border-border px-6 py-3 font-display text-xs font-bold uppercase tracking-widest transition-colors hover:border-neon-cyan"
              >
                Voltar
              </button>
            </div>
          </>
        )}

        {passo === "codigo-gerado" && (
          <>
            <header className="text-center">
              <ShieldCheck className="mx-auto size-10 text-neon-green" />
              <h2 className="mt-4 font-display text-2xl font-black">GUARDE SEU CÓDIGO</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                É com ele que você volta ao seu império de outro aparelho.{" "}
                <span className="text-foreground">Só aparece agora</span> — não conseguimos mostrar
                de novo depois.
              </p>
            </header>

            <div className="glass-card flex items-center justify-between gap-3 p-4">
              <code className="font-mono text-lg font-bold tracking-widest text-neon-green">
                {codigoGerado}
              </code>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(codigoGerado);
                  setCopiado(true);
                }}
                className="flex items-center gap-1.5 border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors hover:border-neon-green hover:text-neon-green"
              >
                <Copy className="size-3" />
                {copiado ? "Copiado" : "Copiar"}
              </button>
            </div>

            <button
              type="button"
              onClick={onEntrou}
              className="btn-skew bg-neon-cyan px-8 py-3 font-display text-xs font-bold text-primary-foreground transition-all hover:brightness-110"
            >
              <span className="btn-skew-inner">EMBARCAR</span>
            </button>
          </>
        )}

        {erro && (
          <p role="alert" className="border border-destructive/50 bg-destructive/10 p-3 text-sm">
            {erro}
          </p>
        )}
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
        O acesso é por telefone + código, o mesmo modelo dos squads públicos da Pulsar. Serve para
        estatística de jogo, não guarde nada sensível aqui.
      </p>
    </div>
  );
}
