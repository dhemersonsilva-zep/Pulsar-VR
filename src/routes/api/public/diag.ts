import { createFileRoute } from "@tanstack/react-router";
import { limparUrlSupabase } from "@/integrations/supabase/env";

// DIAGNOSTICO TEMPORARIO — removido logo apos a leitura.
// Exige token e nunca devolve valor de segredo, so booleanos e codigo de erro.
const TOKEN = "fd1a1e7982343951254486a0";

export const Route = createFileRoute("/api/public/diag")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("t") !== TOKEN) {
          return new Response("not found", { status: 404 });
        }

        const env = {
          SUPABASE_URL: Boolean(process.env["SUPABASE_URL"]),
          SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env["SUPABASE_SERVICE_ROLE_KEY"]),
          SUPABASE_PUBLISHABLE_KEY: Boolean(process.env["SUPABASE_PUBLISHABLE_KEY"]),
          // So o host, para saber QUAL projeto a producao usa. Nao e segredo:
          // o mesmo valor ja vai embutido no bundle do navegador.
          urlBruta: (process.env["SUPABASE_URL"] ?? "").slice(0, 90),
          urlSaneada: limparUrlSupabase(process.env["SUPABASE_URL"]) ?? null,
        };

        const tabelas: Record<string, string> = {};
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          for (const t of [
            "reservas",
            "grupos",
            "jogadores",
            "jogador_sessoes",
            "jogador_conquistas",
            "creditos_transacoes",
            "reservas_concluidas",
            "jogador_estatisticas",
          ]) {
            const { error } = await (
              supabaseAdmin as never as {
                from: (t: string) => {
                  select: (
                    c: string,
                    o: unknown,
                  ) => Promise<{ error: { code?: string; message?: string } | null }>;
                };
              }
            )
              .from(t)
              .select("*", { count: "exact", head: true });
            tabelas[t] = error
              ? `ERRO ${error.code ?? ""} ${(error.message ?? "").slice(0, 90)}`
              : "ok";
          }
        } catch (e) {
          tabelas["_falha"] = e instanceof Error ? e.message.slice(0, 200) : String(e);
        }

        return new Response(JSON.stringify({ env, tabelas }, null, 2), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
