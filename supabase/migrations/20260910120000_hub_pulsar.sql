-- HUB PULSAR / MEU IMPÉRIO
--
-- Identidade do jogador ancorada no telefone que a reserva JÁ captura hoje —
-- nenhum sistema de login novo, mesmo padrão de segredo hasheado que
-- `grupos.edit_key_hash` usa. Todas as estatísticas são derivadas de
-- `public.reservas`; nada de horas, XP ou créditos inventados.
--
-- RLS fica ligada e SEM policy em tudo, igual às tabelas existentes: o acesso
-- é exclusivamente pelo service role, dentro das server functions.

-- ---------------------------------------------------------------------------
-- 1) Telefone normalizado na reserva
-- ---------------------------------------------------------------------------
-- Coluna GERADA: vale retroativamente para todas as reservas já existentes,
-- sem backfill. Guarda só os 11 últimos dígitos (padrão de celular no Brasil),
-- então "(42) 99941-3305", "42999413305" e "+5542999413305" convergem.

ALTER TABLE public.reservas
  ADD COLUMN IF NOT EXISTS cliente_telefone_norm text
  GENERATED ALWAYS AS (right(regexp_replace(cliente_telefone, '[^0-9]', '', 'g'), 11)) STORED;

CREATE INDEX IF NOT EXISTS reservas_telefone_norm_idx
  ON public.reservas (cliente_telefone_norm);

-- ---------------------------------------------------------------------------
-- 2) Jogo da sessão (opcional)
-- ---------------------------------------------------------------------------
-- Nullable de propósito: reservas antigas não têm essa informação e não devem
-- ganhar um valor falso. A UI mostra "sem dados" enquanto não houver volume.

ALTER TABLE public.reservas
  ADD COLUMN IF NOT EXISTS jogo text;

CREATE INDEX IF NOT EXISTS reservas_jogo_idx
  ON public.reservas (jogo) WHERE jogo IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 3) Jogadores (perfil / império individual)
-- ---------------------------------------------------------------------------

CREATE TABLE public.jogadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telefone_norm text NOT NULL UNIQUE,
  comandante text NOT NULL,
  imperio_nome text NOT NULL,
  squad_nome text,
  avatar_id text NOT NULL DEFAULT 'nova',
  emblema_id text NOT NULL DEFAULT 'pulsar',
  -- Vínculo opcional com o squad/império público que já existe em `grupos`.
  grupo_id uuid REFERENCES public.grupos(id),
  access_key_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Nome de império é único (case-insensitive) — é identidade pública.
CREATE UNIQUE INDEX jogadores_imperio_nome_uniq
  ON public.jogadores (lower(imperio_nome));

GRANT ALL ON public.jogadores TO service_role;
ALTER TABLE public.jogadores ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER jogadores_set_updated_at BEFORE UPDATE ON public.jogadores
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4) Sessões
-- ---------------------------------------------------------------------------
-- O cookie do navegador guarda um token opaco e aleatório; aqui fica só o
-- hash. O frontend nunca vê o id do jogador, então não tem como forjar acesso.

CREATE TABLE public.jogador_sessoes (
  token_hash text PRIMARY KEY,
  jogador_id uuid NOT NULL REFERENCES public.jogadores(id) ON DELETE CASCADE,
  expira_em timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX jogador_sessoes_jogador_idx ON public.jogador_sessoes (jogador_id);
CREATE INDEX jogador_sessoes_expira_idx ON public.jogador_sessoes (expira_em);

GRANT ALL ON public.jogador_sessoes TO service_role;
ALTER TABLE public.jogador_sessoes ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 5) Conquistas desbloqueadas
-- ---------------------------------------------------------------------------
-- O catálogo vive no código (`src/lib/progressao.ts`); aqui fica só o registro
-- de quem desbloqueou o quê e quando. A PK composta garante que uma conquista
-- nunca é desbloqueada duas vezes.

CREATE TABLE public.jogador_conquistas (
  jogador_id uuid NOT NULL REFERENCES public.jogadores(id) ON DELETE CASCADE,
  conquista_id text NOT NULL,
  desbloqueada_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (jogador_id, conquista_id)
);

GRANT ALL ON public.jogador_conquistas TO service_role;
ALTER TABLE public.jogador_conquistas ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 6) Créditos Pulsar (livro-razão)
-- ---------------------------------------------------------------------------
-- Saldo = SUM(delta). Nunca guardamos um saldo denormalizado que possa
-- divergir. `referencia` torna o lançamento idempotente: creditar a mesma
-- reserva duas vezes é impossível.

CREATE TABLE public.creditos_transacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jogador_id uuid NOT NULL REFERENCES public.jogadores(id) ON DELETE CASCADE,
  delta integer NOT NULL,
  motivo text NOT NULL,
  referencia text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX creditos_transacoes_ref_uniq
  ON public.creditos_transacoes (jogador_id, referencia)
  WHERE referencia IS NOT NULL;

CREATE INDEX creditos_transacoes_jogador_idx
  ON public.creditos_transacoes (jogador_id, created_at DESC);

GRANT ALL ON public.creditos_transacoes TO service_role;
ALTER TABLE public.creditos_transacoes ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 7) Reservas concluídas
-- ---------------------------------------------------------------------------
-- Não existe status 'concluido' no fluxo do Mercado Pago, e criar um exigiria
-- um cron. "Concluída" é derivada com segurança: foi paga E o horário de
-- término já passou no fuso de Guarapuava.
--
-- `data` e `hora` são wall-clock local, então comparamos contra o now() também
-- convertido para wall-clock local — sem conversão de fuso dos dois lados.

-- security_invoker = true é OBRIGATÓRIO aqui: sem ele a view roda com os
-- privilégios do dono e IGNORA a RLS de `reservas`, o que exporia o histórico
-- de todos os clientes para quem tivesse a chave anônima.
CREATE OR REPLACE VIEW public.reservas_concluidas
WITH (security_invoker = true) AS
SELECT
  r.id,
  r.cliente_telefone_norm,
  r.estacao_id,
  r.estacao_nome,
  r.jogo,
  r.data,
  r.hora,
  r.duracao_horas,
  r.pessoas,
  r.total_centavos,
  r.grupo_id,
  (r.data + r.hora::time + make_interval(hours => r.duracao_horas)) AS fim_local
FROM public.reservas r
WHERE r.status = 'pago'
  AND (r.data + r.hora::time + make_interval(hours => r.duracao_horas))
      <= (now() AT TIME ZONE 'America/Sao_Paulo');

REVOKE ALL ON public.reservas_concluidas FROM anon, authenticated;
GRANT SELECT ON public.reservas_concluidas TO service_role;

-- ---------------------------------------------------------------------------
-- 8) Agregado por jogador (usado pelo ranking)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.jogador_estatisticas
WITH (security_invoker = true) AS
SELECT
  j.id                                             AS jogador_id,
  COALESCE(SUM(rc.duracao_horas), 0)::integer * 60 AS minutos_concluidos,
  COUNT(rc.id)::integer                            AS reservas_concluidas,
  COUNT(DISTINCT rc.estacao_id)::integer           AS estacoes_distintas
FROM public.jogadores j
LEFT JOIN public.reservas_concluidas rc
  ON rc.cliente_telefone_norm = j.telefone_norm
GROUP BY j.id;

REVOKE ALL ON public.jogador_estatisticas FROM anon, authenticated;
GRANT SELECT ON public.jogador_estatisticas TO service_role;

-- ---------------------------------------------------------------------------
-- 9) Limpeza de sessões expiradas
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.limpar_sessoes_expiradas()
RETURNS void
LANGUAGE sql
SET search_path = public
AS $$
  DELETE FROM public.jogador_sessoes WHERE expira_em < now();
$$;

REVOKE ALL ON FUNCTION public.limpar_sessoes_expiradas() FROM anon, authenticated;

-- Também bloqueia o acesso direto às tabelas novas pela chave anônima. A RLS
-- sem policy já cobriria isso, mas negar o privilégio é a segunda tranca.
REVOKE ALL ON public.jogadores FROM anon, authenticated;
REVOKE ALL ON public.jogador_sessoes FROM anon, authenticated;
REVOKE ALL ON public.jogador_conquistas FROM anon, authenticated;
REVOKE ALL ON public.creditos_transacoes FROM anon, authenticated;
