import { createFileRoute } from "@tanstack/react-router";
import { limparUrlSupabase } from "@/integrations/supabase/env";

// DIAGNOSTICO TEMPORARIO — removido apos a leitura.
// Lista NOMES de variaveis presentes; nunca valores.
const TOKEN = "fd1a1e7982343951254486a0";

export const Route = createFileRoute("/api/public/diag")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (new URL(request.url).searchParams.get("t") !== TOKEN) {
          return new Response("not found", { status: 404 });
        }

        const nomes = Object.keys(process.env)
          .filter((k) => /SUPABASE|PULSAR/i.test(k))
          .sort();

        const presentes: Record<string, boolean> = {};
        for (const n of nomes) presentes[n] = Boolean(process.env[n]);

        return new Response(
          JSON.stringify(
            {
              variaveisEncontradas: presentes,
              PULSAR_SUPABASE_URL_definida: Boolean(process.env["PULSAR_SUPABASE_URL"]),
              projetoEmUso: limparUrlSupabase(
                process.env["PULSAR_SUPABASE_URL"] ?? process.env["SUPABASE_URL"],
              ),
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
