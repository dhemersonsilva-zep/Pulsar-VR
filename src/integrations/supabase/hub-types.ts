/**
 * Tipos das tabelas do HUB Pulsar.
 *
 * `types.ts` é gerado automaticamente pelo Supabase e não deve ser editado à
 * mão, então as tabelas criadas em `20260910120000_hub_pulsar.sql` ficam aqui
 * até a próxima regeneração. Depois de rodar `supabase gen types`, este
 * arquivo pode ser apagado e os imports apontados para `types.ts`.
 *
 * Inclui também `reservas` com as duas colunas novas
 * (`cliente_telefone_norm`, `jogo`), que o arquivo gerado ainda não conhece.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export type JogadorRow = {
  id: string;
  telefone_norm: string;
  comandante: string;
  imperio_nome: string;
  squad_nome: string | null;
  avatar_id: string;
  emblema_id: string;
  grupo_id: string | null;
  access_key_hash: string;
  created_at: string;
  updated_at: string;
};

export type ReservaHubRow = {
  id: string;
  cliente_nome: string;
  cliente_telefone: string;
  cliente_telefone_norm: string | null;
  codigo: string | null;
  estacao_id: string;
  estacao_nome: string;
  jogo: string | null;
  data: string;
  hora: string;
  duracao_horas: number;
  pessoas: number;
  total_centavos: number;
  status: string;
  grupo_id: string | null;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ReservaConcluidaRow = {
  id: string;
  cliente_telefone_norm: string | null;
  estacao_id: string;
  estacao_nome: string;
  jogo: string | null;
  data: string;
  hora: string;
  duracao_horas: number;
  pessoas: number;
  total_centavos: number;
  grupo_id: string | null;
  fim_local: string;
};

export type HubDatabase = {
  public: {
    Tables: {
      jogadores: {
        Row: JogadorRow;
        Insert: Omit<JogadorRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<JogadorRow>;
        Relationships: [];
      };
      jogador_sessoes: {
        Row: {
          token_hash: string;
          jogador_id: string;
          expira_em: string;
          created_at: string;
        };
        Insert: {
          token_hash: string;
          jogador_id: string;
          expira_em: string;
          created_at?: string;
        };
        Update: Partial<{
          token_hash: string;
          jogador_id: string;
          expira_em: string;
        }>;
        Relationships: [];
      };
      jogador_conquistas: {
        Row: { jogador_id: string; conquista_id: string; desbloqueada_em: string };
        Insert: { jogador_id: string; conquista_id: string; desbloqueada_em?: string };
        Update: Partial<{ jogador_id: string; conquista_id: string; desbloqueada_em: string }>;
        Relationships: [];
      };
      creditos_transacoes: {
        Row: {
          id: string;
          jogador_id: string;
          delta: number;
          motivo: string;
          referencia: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          jogador_id: string;
          delta: number;
          motivo: string;
          referencia?: string | null;
          created_at?: string;
        };
        Update: Partial<{ delta: number; motivo: string; referencia: string | null }>;
        Relationships: [];
      };
      reservas: {
        Row: ReservaHubRow;
        Insert: Partial<ReservaHubRow>;
        Update: Partial<ReservaHubRow>;
        Relationships: [];
      };
      grupos: {
        Row: {
          id: string;
          tipo: string;
          nome: string;
          slug: string;
          tamanho: number;
          banner_path: string | null;
          total_minutos_jogados: number;
          jogos_realizados: number;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      reservas_concluidas: {
        Row: ReservaConcluidaRow;
        Relationships: [];
      };
      jogador_estatisticas: {
        Row: {
          jogador_id: string;
          minutos_concluidos: number;
          reservas_concluidas: number;
          estacoes_distintas: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type HubClient = SupabaseClient<HubDatabase, "public">;

/**
 * Mesmo client service-role de sempre, só que tipado com as tabelas do HUB.
 * Continua sendo o único caminho de acesso — RLS segue ligada e sem policy,
 * então nada disso é alcançável a partir do navegador.
 */
export async function hubDb(): Promise<HubClient> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as HubClient;
}
