import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const reservaSchema = z.object({
  estacaoId: z.string().min(1).max(40),
  estacaoNome: z.string().min(1).max(60),
  nome: z.string().min(2).max(80),
  telefone: z.string().min(8).max(25),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora: z.string().min(4).max(5),
  duracao: z.number().int().min(1).max(6),
  pessoas: z.number().int().min(1).max(8),
  totalCentavos: z.number().int().min(100).max(500000),
});

const pedidoSchema = z.object({
  nome: z.string().min(2).max(80),
  telefone: z.string().min(8).max(25),
  itens: z
    .array(
      z.object({
        id: z.string().min(1).max(40),
        nome: z.string().min(1).max(80),
        precoCentavos: z.number().int().min(100).max(2000000),
        quantidade: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(20),
});

type MpItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: "BRL";
};

async function criarPreferencia(params: {
  items: MpItem[];
  externalReference: string;
  payerName: string;
  origin: string;
}) {
  const token = process.env["MERCADOPAGO_ACCESS_TOKEN"];
  if (!token) throw new Error("Mercado Pago não configurado");

  // O Mercado Pago exige URLs públicas (https). Em localhost, omitimos
  // back_urls/notification_url para o checkout ainda funcionar em teste.
  const publico = params.origin.startsWith("https://") && !params.origin.includes("localhost");

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: params.items,
      payer: { name: params.payerName },
      external_reference: params.externalReference,
      statement_descriptor: "PULSAR VR",
      payment_methods: { installments: 6 },
      ...(publico
        ? {
            back_urls: {
              success: `${params.origin}/pagamento?status=sucesso`,
              pending: `${params.origin}/pagamento?status=pendente`,
              failure: `${params.origin}/pagamento?status=falha`,
            },
            auto_return: "approved",
            notification_url: `${params.origin}/api/public/mercadopago-webhook`,
          }
        : {}),
    }),
  });

  const payload = (await response.json()) as {
    id?: string;
    init_point?: string;
    sandbox_init_point?: string;
    message?: string;
  };

  if (!response.ok || !payload.init_point) {
    console.error("Mercado Pago preference error", response.status, payload.message);
    throw new Error("Não foi possível iniciar o pagamento. Tente novamente.");
  }

  return {
    preferenceId: payload.id ?? null,
    initPoint: payload.init_point,
  };
}

function getOrigin() {
  const request = getRequest();
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    return `${proto}://${forwardedHost}`;
  }
  const origin = request.headers.get("origin");
  if (origin?.startsWith("https://")) return origin;
  return new URL(request.url).origin;
}

export const criarPagamentoReserva = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => reservaSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: reserva, error } = await supabaseAdmin
      .from("reservas")
      .insert({
        estacao_id: data.estacaoId,
        estacao_nome: data.estacaoNome,
        cliente_nome: data.nome,
        cliente_telefone: data.telefone,
        data: data.data,
        hora: data.hora,
        duracao_horas: data.duracao,
        pessoas: data.pessoas,
        total_centavos: data.totalCentavos,
      })
      .select("id")
      .single();

    if (error || !reserva) {
      console.error("Erro ao criar reserva", error);
      throw new Error("Não foi possível registrar a reserva.");
    }

    const { preferenceId, initPoint } = await criarPreferencia({
      items: [
        {
          id: data.estacaoId,
          title: `Reserva ${data.estacaoNome} · ${data.duracao}h · ${data.pessoas}p`,
          quantity: 1,
          unit_price: data.totalCentavos / 100,
          currency_id: "BRL",
        },
      ],
      externalReference: `reserva:${reserva.id}`,
      payerName: data.nome,
      origin: getOrigin(),
    });

    await supabaseAdmin
      .from("reservas")
      .update({ mp_preference_id: preferenceId })
      .eq("id", reserva.id);

    return { initPoint };
  });

export const criarPagamentoPedido = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => pedidoSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const totalCentavos = data.itens.reduce(
      (soma, item) => soma + item.precoCentavos * item.quantidade,
      0,
    );

    const { data: pedido, error } = await supabaseAdmin
      .from("pedidos")
      .insert({
        cliente_nome: data.nome,
        cliente_telefone: data.telefone,
        itens: data.itens,
        total_centavos: totalCentavos,
      })
      .select("id")
      .single();

    if (error || !pedido) {
      console.error("Erro ao criar pedido", error);
      throw new Error("Não foi possível registrar o pedido.");
    }

    const { preferenceId, initPoint } = await criarPreferencia({
      items: data.itens.map((item) => ({
        id: item.id,
        title: item.nome,
        quantity: item.quantidade,
        unit_price: item.precoCentavos / 100,
        currency_id: "BRL" as const,
      })),
      externalReference: `pedido:${pedido.id}`,
      payerName: data.nome,
      origin: getOrigin(),
    });

    await supabaseAdmin
      .from("pedidos")
      .update({ mp_preference_id: preferenceId })
      .eq("id", pedido.id);

    return { initPoint };
  });
