import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { PixelDecor, PixelMolecule, PixelMouse } from "@/components/site/PixelDecor";
import { criarPagamentoPedido } from "@/lib/checkout.functions";
import { precoBRL, produtos, type Produto } from "@/lib/pulsar-data";

export const Route = createFileRoute("/loja")({
  head: () => ({
    meta: [
      { title: "Loja Gear | Acessórios gamers na Pulsar VR" },
      {
        name: "description",
        content:
          "Mouses, teclados mecânicos, headsets e mousepads selecionados pela Pulsar VR. Pague com Pix ou cartão e retire em Guarapuava.",
      },
      { property: "og:title", content: "Loja Gear | Pulsar VR" },
      {
        property: "og:description",
        content:
          "Mouses, teclados, headsets e mousepads com pagamento Pix ou cartão.",
      },
    ],
  }),
  component: Loja,
});

type ItemCarrinho = { produto: Produto; quantidade: number };

function Loja() {
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const pagar = useServerFn(criarPagamentoPedido);

  const total = carrinho.reduce(
    (soma, item) => soma + item.produto.preco * item.quantidade,
    0,
  );

  function adicionar(produto: Produto) {
    setCarrinho((atual) => {
      const existente = atual.find((i) => i.produto.id === produto.id);
      if (existente) {
        return atual.map((i) =>
          i.produto.id === produto.id
            ? { ...i, quantidade: Math.min(20, i.quantidade + 1) }
            : i,
        );
      }
      return [...atual, { produto, quantidade: 1 }];
    });
  }

  function alterar(id: string, delta: number) {
    setCarrinho((atual) =>
      atual
        .map((i) =>
          i.produto.id === id
            ? { ...i, quantidade: Math.min(20, i.quantidade + delta) }
            : i,
        )
        .filter((i) => i.quantidade > 0),
    );
  }

  async function finalizar() {
    setErro(null);
    if (carrinho.length === 0) return setErro("Seu carrinho está vazio.");
    if (nome.trim().length < 2) return setErro("Informe seu nome.");
    if (telefone.trim().length < 8) return setErro("Informe seu telefone.");

    setCarregando(true);
    try {
      const { initPoint } = await pagar({
        data: {
          nome: nome.trim(),
          telefone: telefone.trim(),
          itens: carrinho.map((i) => ({
            id: i.produto.id,
            nome: i.produto.nome,
            precoCentavos: Math.round(i.produto.preco * 100),
            quantidade: i.quantidade,
          })),
        },
      });
      window.location.href = initPoint;
    } catch (e) {
      console.error(e);
      setErro("Não foi possível abrir o pagamento. Tente novamente.");
      setCarregando(false);
    }
  }

  return (
    <main className="relative mx-auto max-w-7xl overflow-hidden px-6 pb-24 pt-32">
      <PixelDecor
        items={[
          { icon: PixelMouse, className: "right-[4%] top-[14%] w-[34px] h-[44px] text-neon-orange", duration: "10s", opacity: 0.24 },
          { icon: PixelMolecule, className: "left-[3%] bottom-[10%] w-8 h-8 text-neon-cyan", duration: "12s", delay: "1.2s", drift: true },
        ]}
      />
      <h1 className="font-display text-4xl font-black">
        LOJA <span className="text-neon-orange">GEAR</span>
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Periféricos testados por quem joga de verdade. Pague no Pix ou cartão e
        retire na loja em Guarapuava.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {produtos.map((p) => (
            <ProductCard key={p.id} produto={p} onAdd={adicionar} />
          ))}
        </div>

        <aside className="glass-card h-fit space-y-6 p-8 lg:sticky lg:top-28">
          <h2 className="font-display text-lg font-bold">Seu carrinho</h2>

          {carrinho.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum item ainda. Passe o mouse num produto e clique em
              adicionar.
            </p>
          ) : (
            <ul className="space-y-4 text-sm">
              {carrinho.map((item) => (
                <li key={item.produto.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium">{item.produto.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {precoBRL(item.produto.preco * item.quantidade)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Remover um ${item.produto.nome}`}
                      onClick={() => alterar(item.produto.id, -1)}
                      className="size-7 border border-border"
                    >
                      −
                    </button>
                    <span className="w-5 text-center">{item.quantidade}</span>
                    <button
                      type="button"
                      aria-label={`Adicionar um ${item.produto.nome}`}
                      onClick={() => alterar(item.produto.id, 1)}
                      className="size-7 border border-border"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="grid gap-3">
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              className="w-full border border-input bg-card p-3 text-sm outline-none focus:border-neon-orange"
            />
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(42) 9XXXX-XXXX"
              className="w-full border border-input bg-card p-3 text-sm outline-none focus:border-neon-orange"
            />
          </div>

          <div className="flex items-baseline justify-between border-t border-border pt-4">
            <span className="font-medium">Total</span>
            <span className="font-display text-2xl font-bold text-neon-orange">
              {precoBRL(total)}
            </span>
          </div>

          {erro && <p className="text-sm text-destructive">{erro}</p>}

          <button
            type="button"
            onClick={() => void finalizar()}
            disabled={carregando}
            className="w-full bg-neon-orange py-4 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
          >
            {carregando ? "Abrindo pagamento..." : "Pagar com Pix ou cartão"}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Pagamento seguro pelo Mercado Pago · Pix, cartão e boleto.
          </p>
        </aside>
      </div>
    </main>
  );
}
