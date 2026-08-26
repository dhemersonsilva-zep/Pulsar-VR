import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { X } from "lucide-react";
import { listarGruposParaVincular } from "@/lib/grupos.functions";

export type GrupoSelecionado = { id: string; nome: string; tipo: "squad" | "imperio" };

/** Vincular (opcional) uma reserva a um squad/império já criado — soma horas ao ranking dele. */
export function GrupoLinkPicker({
  value,
  onChange,
}: {
  value: GrupoSelecionado | null;
  onChange: (grupo: GrupoSelecionado | null) => void;
}) {
  const [tipo, setTipo] = useState<"squad" | "imperio">("squad");
  const [busca, setBusca] = useState("");
  const buscar = useServerFn(listarGruposParaVincular);

  const { data: resultados } = useQuery({
    queryKey: ["grupos-busca", tipo, busca],
    queryFn: () => buscar({ data: { tipo, ...(busca.trim() ? { busca: busca.trim() } : {}) } }),
  });

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 border border-neon-cyan/40 bg-neon-cyan/5 p-3 text-sm">
        <span>
          Vinculada a <strong>{value.nome}</strong> ({value.tipo === "squad" ? "squad" : "império"})
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Remover vínculo"
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex gap-2">
        {(["squad", "imperio"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
            className={`border px-3 py-1.5 text-xs font-medium transition-all ${
              tipo === t ? "border-neon-cyan text-neon-cyan" : "border-border text-muted-foreground"
            }`}
          >
            {t === "squad" ? "Squad" : "Império"}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder={`Buscar ${tipo === "squad" ? "squad" : "império"} pelo nome (opcional)`}
        className="w-full border border-input bg-card p-3 text-sm outline-none focus:border-neon-cyan"
      />
      {busca.trim().length > 0 && resultados && resultados.length > 0 && (
        <div className="mt-2 max-h-40 divide-y divide-border overflow-y-auto border border-border">
          {resultados.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => onChange({ id: g.id, nome: g.nome, tipo })}
              className="block w-full p-3 text-left text-sm transition-colors hover:bg-card"
            >
              {g.nome}
            </button>
          ))}
        </div>
      )}
      {busca.trim().length > 0 && resultados && resultados.length === 0 && (
        <p className="mt-2 text-xs text-muted-foreground">Nenhum resultado.</p>
      )}
    </div>
  );
}
