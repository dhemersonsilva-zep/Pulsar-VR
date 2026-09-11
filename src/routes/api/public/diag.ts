import { createFileRoute } from "@tanstack/react-router";
import { limparUrlSupabase } from "@/integrations/supabase/env";

// DIAGNOSTICO TEMPORARIO — removido apos a leitura. So nomes, nunca valores.
// ?t=TOKEN&tabela=nome  -> verifica se a tabela existe no banco da producao.
const TOKEN = "fd1a1e7982343951254486a0";

export const Route = createFileRoute("/api/public/diag")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("t") !== TOKEN) {
          return new Response("not found", { status: 404 });
        }
        const alvo = (url.searchParams.get("tabela") ?? "reservas").replace(/[^a-z0-9_]/gi, "");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const db = supabaseAdmin as never as {
          from: (t: string) => {
            select: (c: string) => {
              limit: (n: number) => Promise<{ error: { message?: string } | null }>;
            };
          };
        };

        const r = await db.from(alvo).select("id").limit(1);
        const colunas = await db.from("reservas").select("estacao_id").limit(1);

        return new Response(
          JSON.stringify(
            {
              projetoEmUso: limparUrlSupabase(process.env["SUPABASE_URL"]) ?? null,
              tabelaConsultada: alvo,
              existe: !r.error,
              erro: r.error?.message?.slice(0, 110) ?? null,
              reservasTemEstacaoId: !colunas.error,
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
