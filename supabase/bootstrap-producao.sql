-- =====================================================================
-- BOOTSTRAP DE PRODUCAO — arquivo de uso UNICO, nao e uma migration
-- =====================================================================
--
-- Contexto: o projeto Supabase apontado pela producao
-- (yxqtllcdqafhtkbeylxz) nunca recebeu as migrations deste repositorio.
-- As tabelas que existem la sao esqueletos: `reservas` so tem
-- id/status/created_at e `grupos` nem existe. Confirmado em 10/09/2026 pelo
-- erro [42703] column reservas.estacao_id does not exist.
--
-- Este arquivo apaga esses esqueletos e aplica as 4 migrations em ordem.
--
-- TRAVA DE SEGURANCA: o bloco abaixo ABORTA tudo se qualquer uma das
-- tabelas tiver ao menos uma linha. O script so roda em banco vazio, entao
-- nao ha como perder reserva, pedido ou perfil por engano.
--
-- Depois de rodar, este arquivo pode ser apagado. As migrations em
-- supabase/migrations/ continuam sendo a fonte da verdade.
-- =====================================================================

DO $seguranca$
DECLARE
  n bigint;
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['reservas', 'pedidos', 'grupos', 'jogadores'] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('SELECT count(*) FROM public.%I', t) INTO n;
      IF n > 0 THEN
        RAISE EXCEPTION
          'ABORTADO: public.% contem % linha(s). Este script apaga tabelas e so deve rodar em banco vazio.', t, n;
      END IF;
    END IF;
  END LOOP;
  RAISE NOTICE 'Trava ok: nenhuma tabela contem dados. Seguindo.';
END
$seguranca$;

-- --- limpeza dos esqueletos ------------------------------------------
DROP VIEW  IF EXISTS public.jogador_estatisticas CASCADE;
DROP VIEW  IF EXISTS public.reservas_concluidas  CASCADE;
DROP TABLE IF EXISTS public.creditos_transacoes  CASCADE;
DROP TABLE IF EXISTS public.jogador_conquistas   CASCADE;
DROP TABLE IF EXISTS public.jogador_sessoes      CASCADE;
DROP TABLE IF EXISTS public.jogadores            CASCADE;
DROP TABLE IF EXISTS public.reservas             CASCADE;
DROP TABLE IF EXISTS public.pedidos              CASCADE;
DROP TABLE IF EXISTS public.grupos               CASCADE;
DROP SEQUENCE IF EXISTS public.reservas_codigo_seq CASCADE;


-- =====================================================================
-- 20260825010258_cca0548d-785e-454d-9573-ef7c9af27dc3.sql
-- =====================================================================

CREATE TABLE public.reservas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estacao_id text NOT NULL,
  estacao_nome text NOT NULL,
  cliente_nome text NOT NULL,
  cliente_telefone text NOT NULL,
  data date NOT NULL,
  hora text NOT NULL,
  duracao_horas integer NOT NULL DEFAULT 1,
  pessoas integer NOT NULL DEFAULT 1,
  total_centavos integer NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  mp_preference_id text,
  mp_payment_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_nome text NOT NULL,
  cliente_telefone text NOT NULL,
  itens jsonb NOT NULL,
  total_centavos integer NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  mp_preference_id text,
  mp_payment_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.reservas TO service_role;
GRANT ALL ON public.pedidos TO service_role;

ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

CREATE INDEX reservas_data_idx ON public.reservas (data, hora);
CREATE INDEX reservas_mp_pref_idx ON public.reservas (mp_preference_id);
CREATE INDEX pedidos_mp_pref_idx ON public.pedidos (mp_preference_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER reservas_set_updated_at BEFORE UPDATE ON public.reservas
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER pedidos_set_updated_at BEFORE UPDATE ON public.pedidos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
-- =====================================================================
-- 20260826120000_add_reserva_codigo.sql
-- =====================================================================

-- Aditivo: código curto e amigável para exibir na confirmação da reserva
-- (ex.: PVR-0001), sem alterar nada do schema existente.

CREATE SEQUENCE IF NOT EXISTS public.reservas_codigo_seq;

ALTER TABLE public.reservas
  ADD COLUMN IF NOT EXISTS codigo text UNIQUE;

CREATE OR REPLACE FUNCTION public.set_reserva_codigo()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.codigo IS NULL THEN
    NEW.codigo := 'PVR-' || lpad(nextval('public.reservas_codigo_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reservas_set_codigo ON public.reservas;
CREATE TRIGGER reservas_set_codigo BEFORE INSERT ON public.reservas
FOR EACH ROW EXECUTE FUNCTION public.set_reserva_codigo();

-- =====================================================================
-- 20260827090000_grupos.sql
-- =====================================================================

-- Squads e Impérios Solo: perfis de comunidade com estatísticas reais,
-- derivadas apenas de reservas efetivamente pagas (nenhum dado inventado).

CREATE TABLE public.grupos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo IN ('squad', 'imperio')),
  nome text NOT NULL,
  slug text NOT NULL UNIQUE,
  tamanho integer NOT NULL DEFAULT 1 CHECK (tamanho BETWEEN 1 AND 8),
  banner_path text,
  telefone_criador text NOT NULL,
  edit_key_hash text NOT NULL,
  total_minutos_jogados integer NOT NULL DEFAULT 0,
  jogos_realizados integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.grupos TO service_role;
ALTER TABLE public.grupos ENABLE ROW LEVEL SECURITY;

CREATE INDEX grupos_tipo_ranking_idx ON public.grupos (tipo, total_minutos_jogados DESC);

CREATE TRIGGER grupos_set_updated_at BEFORE UPDATE ON public.grupos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Vínculo opcional de uma reserva a um squad/império.
ALTER TABLE public.reservas
  ADD COLUMN IF NOT EXISTS grupo_id uuid REFERENCES public.grupos(id);

CREATE INDEX IF NOT EXISTS reservas_grupo_id_idx ON public.reservas (grupo_id);

-- Bucket público (leitura) para os banners. Upload sempre feito pelo
-- service role a partir das server functions — nunca direto do cliente.
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Mantém total_minutos_jogados/jogos_realizados sincronizados só com
-- reservas que de fato foram pagas (status muda para/de 'pago').
CREATE OR REPLACE FUNCTION public.sync_grupo_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'pago' AND NEW.grupo_id IS NOT NULL THEN
      UPDATE public.grupos
      SET total_minutos_jogados = total_minutos_jogados + NEW.duracao_horas * 60,
          jogos_realizados = jogos_realizados + 1
      WHERE id = NEW.grupo_id;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'pago' AND OLD.status IS DISTINCT FROM 'pago' AND NEW.grupo_id IS NOT NULL THEN
      UPDATE public.grupos
      SET total_minutos_jogados = total_minutos_jogados + NEW.duracao_horas * 60,
          jogos_realizados = jogos_realizados + 1
      WHERE id = NEW.grupo_id;
    ELSIF OLD.status = 'pago' AND NEW.status IS DISTINCT FROM 'pago' AND OLD.grupo_id IS NOT NULL THEN
      UPDATE public.grupos
      SET total_minutos_jogados = GREATEST(0, total_minutos_jogados - OLD.duracao_horas * 60),
          jogos_realizados = GREATEST(0, jogos_realizados - 1)
      WHERE id = OLD.grupo_id;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS reservas_sync_grupo_stats ON public.reservas;
CREATE TRIGGER reservas_sync_grupo_stats
AFTER INSERT OR UPDATE ON public.reservas
FOR EACH ROW EXECUTE FUNCTION public.sync_grupo_stats();

-- =====================================================================
-- 20260910120000_hub_pulsar.sql
-- =====================================================================

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
