import { createFileRoute } from "@tanstack/react-router";

// DIAGNOSTICO TEMPORARIO — removido logo apos a leitura.
// Devolve NOMES de coluna, nunca valores: os dados de reserva sao de clientes.
const TOKEN = "fd1a1e7982343951254486a0";

const CANDIDATAS = [
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
  "station_id",
  "station_name",
  "customer_name",
  "customer_phone",
  "date",
  "time",
  "duration_hours",
  "people",
  "total_cents",
  "game",
  "booking_date",
  "start_time",
];

export const Route = createFileRoute("/api/public/diag")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("t") !== TOKEN) return new Response("not found", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const db = supabaseAdmin as never as {
          from: (t: string) => {
            select: (c: string) => {
              limit: (
                n: number,
              ) => Promise<{ data: unknown[] | null; error: { message?: string } | null }>;
            };
          };
        };

        const saida: Record<string, unknown> = {};

        for (const tabela of ["reservas", "grupos", "jogadores"]) {
          const { data, error } = await db.from(tabela).select("*").limit(1);
          if (error) {
            saida[tabela] = { erro: error.message?.slice(0, 120) };
            continue;
          }
          const linha = (data ?? [])[0];
          if (linha && typeof linha === "object") {
            saida[tabela] = { origem: "linha real", colunas: Object.keys(linha).sort() };
            continue;
          }
          // Tabela vazia: descobre coluna a coluna.
          const existem: string[] = [];
          for (const c of CANDIDATAS) {
            const r = await db.from(tabela).select(c).limit(1);
            if (!r.error) existem.push(c);
          }
          saida[tabela] = { origem: "sonda (tabela vazia)", colunas: existem };
        }

        return new Response(JSON.stringify(saida, null, 2), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
