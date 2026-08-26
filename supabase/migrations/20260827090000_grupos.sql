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
