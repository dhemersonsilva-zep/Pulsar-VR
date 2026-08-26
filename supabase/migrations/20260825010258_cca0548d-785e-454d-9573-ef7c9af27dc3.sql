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