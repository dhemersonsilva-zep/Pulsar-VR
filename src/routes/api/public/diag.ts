import { createFileRoute } from "@tanstack/react-router";
import { limparUrlSupabase } from "@/integrations/supabase/env";

// DIAGNOSTICO TEMPORARIO — removido apos a leitura. So nomes, nunca valores.
const TOKEN = "fd1a1e7982343951254486a0";
const COLUNAS = [
  "id",
  "estacao_id",
  "estacao_nome",
  "cliente_nome",
  "cliente_telefone",
  "cliente_telefone_norm",
  "data",
  "hora",
  "duracao_horas",
  "pessoas",
  "total_centavos",
  "status",
  "jogo",
  "codigo",
  "grupo_id",
  "created_at",
  "updated_at",
  "mp_preference_id",
  "mp_payment_id",
];

export const Route = createFileRoute("/api/public/diag")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (new URL(request.url).searchParams.get("t") !== TOKEN) {
          return new Response("not found", { status: 404 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const db = supabaseAdmin as never as {
          from: (t: string) => {
            select: (c: string) => {
              limit: (n: number) => Promise<{ error: { message?: string } | null }>;
            };
          };
        };

        const existentes: string[] = [];
        const faltando: string[] = [];
        for (const c of COLUNAS) {
          const r = await db.from("reservas").select(c).limit(1);
          (r.error ? faltando : existentes).push(c);
        }

        const outras: Record<string, string> = {};
        for (const t of ["grupos", "pedidos", "jogadores", "reservas_concluidas"]) {
          const r = await db.from(t).select("id").limit(1);
          outras[t] = r.error ? `ERRO: ${r.error.message?.slice(0, 80)}` : "existe";
        }

        return new Response(
          JSON.stringify(
            {
              projetoEmUso: limparUrlSupabase(process.env["SUPABASE_URL"]) ?? null,
              reservas: { existentes, faltando },
              outras,
            },
            null,
            2,
          ),
          { headers: { "content-type": "application/json" } },
        );
      },
    },
  },
});
