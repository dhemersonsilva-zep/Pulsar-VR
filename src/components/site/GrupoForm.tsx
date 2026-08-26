import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Check, Copy, TriangleAlert } from "lucide-react";
import { BannerUpload } from "@/components/site/BannerUpload";
import { criarGrupo } from "@/lib/grupos.functions";

type Tipo = "squad" | "imperio";

const COPY: Record<Tipo, { titulo: string; nomeLabel: string; criando: string; criarBtn: string }> =
  {
    squad: {
      titulo: "MONTAR SQUAD",
      nomeLabel: "Nome da squad",
      criando: "Criando squad…",
      criarBtn: "CRIAR SQUAD",
    },
    imperio: {
      titulo: "FUNDAR IMPÉRIO",
      nomeLabel: "Nome do império",
      criando: "Fundando império…",
      criarBtn: "FUNDAR IMPÉRIO",
    },
  };

export function GrupoForm({ tipo }: { tipo: Tipo }) {
  const texto = COPY[tipo];
  const criar = useServerFn(criarGrupo);

  const [nome, setNome] = useState("");
  const [tamanho, setTamanho] = useState(2);
  const [telefone, setTelefone] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState<{ slug: string; editKey: string } | null>(null);
  const [copiado, setCopiado] = useState(false);

  async function criarSubmit() {
    setErro(null);
    if (nome.trim().length < 2) return setErro("Escolha um nome com pelo menos 2 letras.");
    if (telefone.trim().length < 8) return setErro("Informe um telefone de contato.");

    setCarregando(true);
    try {
      const res = await criar({
        data: {
          tipo,
          nome: nome.trim(),
          tamanho,
          telefone: telefone.trim(),
          ...(banner ? { bannerBase64: banner } : {}),
        },
      });
      setResultado(res);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível criar agora. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  function copiarChave() {
    if (!resultado) return;
    void navigator.clipboard.writeText(resultado.editKey);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (resultado) {
    return (
      <div className="glass-panel space-y-6 p-8 text-center">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-neon-cyan">
          {tipo === "squad" ? "Squad criada" : "Império fundado"}
        </span>
        <h2 className="glow-cyan font-display text-2xl font-black">{nome}</h2>

        <div className="glass-card space-y-3 p-6 text-left">
          <p className="flex items-center gap-2 text-sm font-bold text-neon-orange">
            <TriangleAlert className="size-4 shrink-0" /> Guarde este código — é a única forma de
            editar depois.
          </p>
          <button
            type="button"
            onClick={copiarChave}
            className="flex w-full items-center justify-between gap-3 border border-neon-cyan/50 px-4 py-3 font-mono text-lg font-bold text-neon-cyan transition-colors hover:bg-neon-cyan/10"
          >
            {resultado.editKey}
            {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>
        </div>

        <Link
          to={tipo === "squad" ? "/squads/$slug" : "/imperios/$slug"}
          params={{ slug: resultado.slug }}
          className="btn-skew block bg-neon-cyan py-4 text-center font-display text-sm font-bold text-primary-foreground transition-all hover:brightness-110"
        >
          <span className="btn-skew-inner">VER MEU PERFIL</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-panel space-y-6 p-8">
      <div>
        <label className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
          {texto.nomeLabel}
        </label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={40}
          placeholder={tipo === "squad" ? "Ex.: Fênix Gamer House" : "Ex.: Império de Marte"}
          className="w-full border border-input bg-card p-3 text-sm outline-none focus:border-neon-cyan"
        />
      </div>

      {tipo === "squad" && (
        <div>
          <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
            Quantas pessoas na squad?
          </span>
          <div className="flex gap-2">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setTamanho(n)}
                className={`flex-1 border py-3 text-sm font-medium transition-all ${
                  tamanho === n
                    ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                    : "border-border text-muted-foreground hover:border-neon-cyan/40"
                }`}
              >
                {n} pessoas
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
          Seu telefone (contato do responsável)
        </label>
        <input
          type="tel"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="(42) 9XXXX-XXXX"
          className="w-full border border-input bg-card p-3 text-sm outline-none focus:border-neon-cyan"
        />
      </div>

      <BannerUpload value={banner} onChange={setBanner} />

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <button
        type="button"
        onClick={() => void criarSubmit()}
        disabled={carregando}
        className="btn-skew block w-full bg-neon-cyan py-4 text-center font-display text-sm font-bold uppercase tracking-widest text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
      >
        <span className="btn-skew-inner">{carregando ? texto.criando : texto.criarBtn}</span>
      </button>
    </div>
  );
}
