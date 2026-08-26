import { createFileRoute } from "@tanstack/react-router";

type MpPayment = {
  id?: number | string;
  status?: string;
  external_reference?: string | null;
};

const STATUS_MAP: Record<string, string> = {
  approved: "pago",
  authorized: "pago",
  pending: "pendente",
  in_process: "pendente",
  in_mediation: "pendente",
  rejected: "recusado",
  cancelled: "cancelado",
  refunded: "estornado",
  charged_back: "estornado",
};

export const Route = createFileRoute("/api/public/mercadopago-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env["MERCADOPAGO_ACCESS_TOKEN"];
        if (!token) return new Response("not configured", { status: 500 });

        const url = new URL(request.url);
        let paymentId =
          url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? null;

        try {
          const body = (await request.json()) as {
            data?: { id?: string | number };
            type?: string;
            action?: string;
          };
          if (body?.data?.id) paymentId = String(body.data.id);
        } catch {
          // corpo vazio: seguimos com o id da query string
        }

        if (!paymentId) return new Response("ok");

        // Fonte da verdade: consultamos o pagamento direto no Mercado Pago.
        const mpResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!mpResponse.ok) {
          console.error("Falha ao consultar pagamento", mpResponse.status);
          return new Response("ok");
        }

        const payment = (await mpResponse.json()) as MpPayment;
        const reference = payment.external_reference ?? "";
        const [tipo, registroId] = reference.split(":");
        if (!registroId || (tipo !== "reserva" && tipo !== "pedido")) {
          return new Response("ok");
        }

        const status = STATUS_MAP[payment.status ?? ""] ?? "pendente";
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { error } = await supabaseAdmin
          .from(tipo === "reserva" ? "reservas" : "pedidos")
          .update({ status, mp_payment_id: String(payment.id ?? paymentId) })
          .eq("id", registroId);

        if (error) console.error("Falha ao atualizar status", error);

        return new Response("ok");
      },
    },
  },
});
