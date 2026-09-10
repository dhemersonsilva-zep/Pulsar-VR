/**
 * Saneamento das variáveis de ambiente do Supabase.
 *
 * Motivo de existir: em 10/09/2026 a `SUPABASE_URL` de produção foi salva na
 * Vercel como `[https://...` (colada em formato de link markdown). O
 * `createClient` lança "Invalid supabaseUrl" ANTES de qualquer consulta, então
 * TODA server function que fala com o banco morreu de uma vez — inclusive a
 * criação de reserva. E como as outras funções engolem erro, o site seguiu
 * mostrando a agenda inteira livre sem registrar nada.
 *
 * Um caractere colado errado não pode derrubar o sistema de vendas. Aqui
 * removemos os invólucros mais comuns de copiar/colar antes de entregar o
 * valor ao SDK. Isso NÃO substitui arrumar a variável — só evita que o erro
 * seja fatal.
 */

/**
 * Tira invólucros de copiar/colar. Trata o link markdown `[x](y)` ANTES de
 * aparar as pontas: aparar sozinho deixaria `x](y`, que continua quebrado —
 * foi exatamente o que aconteceu com a SUPABASE_URL em produção.
 */
export function limparEnv(valor: string | undefined): string | undefined {
  if (typeof valor !== "string") return valor;

  let v = valor.trim();

  // [texto](destino) -> texto. Quem cola de um chat costuma trazer os dois
  // lados iguais; ficamos com o primeiro.
  const markdown = v.match(/^\[([^\]]+)\]\(([^)]*)\)$/);
  if (markdown?.[1]) v = markdown[1].trim();

  const limpo = v
    .replace(/^[[({<"'`]+/, "")
    .replace(/[\])}>"'`]+$/, "")
    .trim();

  if (limpo && limpo !== valor.trim()) {
    console.warn(
      "[Supabase] Uma variável de ambiente veio com invólucro de colagem e foi corrigida em tempo de execução. Ajuste o valor — isto é um remendo.",
    );
  }

  return limpo.length > 0 ? limpo : undefined;
}

/**
 * Além de limpar, valida que sobrou uma URL http(s). Avisa no log quando
 * precisou consertar, para o problema não ficar invisível.
 */
export function limparUrlSupabase(valor: string | undefined): string | undefined {
  if (typeof valor !== "string") return valor;
  const original = valor.trim();
  if (!original) return undefined;

  // Extrai a PRIMEIRA URL http(s) de dentro do texto, em vez de só aparar as
  // pontas. É o que resolve o caso real: a variável foi salva como link
  // markdown completo, `[https://x.supabase.co](https://x.supabase.co)` —
  // aparar as pontas deixaria `https://x.supabase.co](https://x.supabase.co`,
  // que continua inválido.
  const achado = original.match(/https?:\/\/[^\s\]()<>"'`,]+/i)?.[0];
  const limpo = (achado ?? limparEnv(original) ?? "").replace(/\/+$/, "");

  if (!limpo) {
    console.error("[Supabase] SUPABASE_URL está vazia ou ilegível.");
    return undefined;
  }

  if (limpo !== original) {
    console.warn(
      `[Supabase] SUPABASE_URL veio com conteúdo extra e foi corrigida em tempo de execução para "${limpo}". Ajuste a variável de ambiente — isto é um remendo, não a solução.`,
    );
  }

  if (!/^https?:\/\//i.test(limpo)) {
    console.error(`[Supabase] SUPABASE_URL não parece uma URL http(s): "${limpo}"`);
  }

  return limpo;
}
