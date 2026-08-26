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
