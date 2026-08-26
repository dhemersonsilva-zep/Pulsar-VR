import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { horarios, stations } from "@/lib/pulsar-data";

const diaSchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type StatusHorario = "disponivel" | "poucas_vagas" | "lotado";

export type DisponibilidadeDia = Record<string, Record<string, StatusHorario>>;

/**
 * Disponibilidade real por estação/horário num dia, calculada a partir das
 * reservas já registradas (status ≠ cancelado/recusado) contra a capacidade
 * configurada em `stations[].capacidade` — sem números inventados.
 */
export const getDisponibilidadeDia = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => diaSchema.parse(input))
  .handler(async ({ data }): Promise<DisponibilidadeDia> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: reservas, error } = await supabaseAdmin
      .from("reservas")
      .select("estacao_id, hora, status")
      .eq("data", data.data)
      .not("status", "in", "(cancelado,recusado)");

    if (error) {
      console.error("Erro ao consultar disponibilidade", error);
      return {};
    }

    const ocupacao = new Map<string, number>();
    for (const r of reservas ?? []) {
      const chave = `${r.estacao_id}::${r.hora}`;
      ocupacao.set(chave, (ocupacao.get(chave) ?? 0) + 1);
    }

    const resultado: DisponibilidadeDia = {};
    for (const station of stations) {
      resultado[station.id] = {};
      for (const hora of horarios) {
        const ocupados = ocupacao.get(`${station.id}::${hora}`) ?? 0;
        const restantes = station.capacidade - ocupados;
        let status: StatusHorario;
        if (restantes <= 0) status = "lotado";
        else if (station.capacidade > 1 && restantes === 1) status = "poucas_vagas";
        else status = "disponivel";
        resultado[station.id]![hora] = status;
      }
    }

    return resultado;
  });
