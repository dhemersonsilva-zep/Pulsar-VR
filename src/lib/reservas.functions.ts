import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const idSchema = z.object({
  id: z.string().uuid(),
});

/**
 * Busca os dados de uma reserva para a tela de confirmação, a partir do id
 * que o Mercado Pago devolve em `external_reference` na back_url de sucesso.
 * Retorna só os campos necessários para exibir a confirmação.
 */
export const buscarReservaPorId = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: reserva, error } = await supabaseAdmin
      .from("reservas")
      .select(
        "id, codigo, estacao_id, estacao_nome, cliente_nome, data, hora, duracao_horas, pessoas, total_centavos, status",
      )
      .eq("id", data.id)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar reserva", error);
      return null;
    }

    return reserva;
  });
